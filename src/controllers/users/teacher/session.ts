import { BadRequest } from "../../../Errors/BadRequest";
import { NotFound } from "../../../Errors/NotFound";
import Schedule from "../../../models/schema/admin/Schedule";
import { Request, Response } from "express";
import TeacherSession from "../../../models/schema/user/teachersession";
import Student from "../../../models/schema/admin/Student";
import { SuccessResponse } from "../../../utils/response";
import Attendance from "../../../models/schema/admin/Attendance";
import Homework from "../../../models/schema/user/homework";
import { saveBase64Image } from "../../../utils/handleImages";

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Get Teacher's Active Session
// ═══════════════════════════════════════════════════════════════

const getActiveSession = async (teacherId: string, schoolId: string) => {
    return await TeacherSession.findOne({
        teacher: teacherId,
        school: schoolId,
        status: 'active',
    });
};

// ═══════════════════════════════════════════════════════════════
// ▶️ START SESSION (بدء الحصة)
// ═══════════════════════════════════════════════════════════════

export const startSession = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { scheduleId } = req.body;

    // Check if teacher already has an active session
    const existingActiveSession = await getActiveSession(teacherId!, schoolId!);
    if (existingActiveSession) {
        throw new BadRequest('لديك حصة مفتوحة بالفعل، يجب إنهاؤها أولاً');
    }

    // Get schedule
    const schedule = await Schedule.findOne({
        _id: scheduleId,
        school: schoolId,
        teacher: teacherId,
        status: 'active',
    }).populate('period', 'name startTime endTime');

    if (!schedule) {
        throw new NotFound('الحصة غير موجودة');
    }

    // Check if today matches schedule day
    const today = new Date();
    const dayOfWeek = today.getDay();

    if (schedule.dayOfWeek !== dayOfWeek) {
        throw new BadRequest('هذه الحصة ليست اليوم');
    }

    // Check if session already exists today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingSession = await TeacherSession.findOne({
        school: schoolId,
        schedule: scheduleId,
        date: { $gte: todayStart, $lte: todayEnd },
    });

    if (existingSession) {
        if (existingSession.status === 'completed') {
            throw new BadRequest('الحصة انتهت بالفعل اليوم');
        }
    }

    // Create session
    const session = await TeacherSession.create({
        school: schoolId,
        teacher: teacherId,
        schedule: scheduleId,
        class: schedule.class,
        grade: schedule.grade,
        subject: schedule.subject,
        period: schedule.period,
        date: todayStart,
        startedAt: new Date(),
        status: 'active',
        attendanceCount: { present: 0, absent: 0, late: 0, excused: 0 },
    });

    // Get students for attendance
    const students = await Student.find({
        school: schoolId,
        classId: schedule.class,
        status: 'active',
    })
        .select('name nameEn studentCode avatar gender')
        .sort({ name: 1 });

    // Populate session
    await session.populate('class', 'name');
    await session.populate('grade', 'name nameEn');
    await session.populate('subject', 'name nameEn');
    await session.populate('period', 'name startTime endTime');

    return SuccessResponse(res, {
        session,
        students,
        studentsCount: students.length,
        message: 'تم بدء الحصة بنجاح'
    }, 201);
};

// ═══════════════════════════════════════════════════════════════
// 🎯 GET ACTIVE SESSION (جلب الحصة المفتوحة)
// ═══════════════════════════════════════════════════════════════

export const getMyActiveSession = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;

    const session = await TeacherSession.findOne({
        school: schoolId,
        teacher: teacherId,
        status: 'active',
    })
        .populate('class', 'name')
        .populate('grade', 'name nameEn')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime');

    if (!session) {
        return SuccessResponse(res, {
            hasActiveSession: false,
            session: null,
            students: [],
        });
    }

    // Get students with attendance status
    const students = await Student.find({
        school: schoolId,
        classId: session.class,
        status: 'active',
    })
        .select('name nameEn studentCode avatar gender')
        .sort({ name: 1 });

    // Get existing attendance
    const attendance = await Attendance.find({
        school: schoolId,
        session: session._id,
    });

    const attendanceMap = new Map(
        attendance.map(a => [a.student.toString(), a])
    );

    const studentsWithAttendance = students.map(student => {
        const att = attendanceMap.get(student._id.toString());
        return {
            _id: student._id,
            name: student.name,
            nameEn: student.nameEn,
            studentCode: student.studentCode,
            avatar: student.avatar,
            gender: student.gender,
            attendance: att ? {
                status: att.status,
                notes: att.notes,
            } : null,
        };
    });

    return SuccessResponse(res, {
        hasActiveSession: true,
        session,
        students: studentsWithAttendance,
        studentsCount: students.length,
    });
};

// ═══════════════════════════════════════════════════════════════
// 📝 RECORD ATTENDANCE (تسجيل الحضور - بدون sessionId)
// ═══════════════════════════════════════════════════════════════

export const recordAttendance = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { attendance } = req.body;  // بدون sessionId

    // Get active session automatically
    const session = await getActiveSession(teacherId!, schoolId!);

    if (!session) {
        throw new BadRequest('لا توجد حصة مفتوحة');
    }

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Record attendance for each student
    const attendanceRecords = [];
    const errors = [];
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };

    for (const record of attendance) {
        try {
            // Verify student is in this class
            const student = await Student.findOne({
                _id: record.studentId,
                classId: session.class,
                school: schoolId,
                status: 'active',
            });

            if (!student) {
                errors.push({
                    studentId: record.studentId,
                    error: 'الطالب غير موجود في هذا الفصل',
                });
                continue;
            }

            // Update or create attendance
            const attendanceRecord = await Attendance.findOneAndUpdate(
                {
                    school: schoolId,
                    student: record.studentId,
                    session: session._id,
                    date: today,
                },
                {
                    $set: {
                        class: session.class,
                        grade: session.grade,
                        status: record.status,
                        recordedBy: teacherId,
                        recordedByModel: 'Teacher',
                        notes: record.notes || null,
                    },
                },
                { upsert: true, new: true }
            );

            attendanceRecords.push(attendanceRecord);
            counts[record.status as keyof typeof counts]++;
        } catch (error) {
            errors.push({
                studentId: record.studentId,
                error: 'خطأ في حفظ الحضور',
            });
        }
    }

    // Update session attendance count
    await TeacherSession.findByIdAndUpdate(session._id, {
        $set: { attendanceCount: counts },
    });

    return SuccessResponse(res, {
        saved: attendanceRecords.length,
        errors: errors.length > 0 ? errors : undefined,
        counts,
        message: errors.length > 0
            ? `تم حفظ ${attendanceRecords.length} سجل مع ${errors.length} أخطاء`
            : 'تم تسجيل الحضور بنجاح'
    });
};

// ═══════════════════════════════════════════════════════════════
// ⏹️ END SESSION (إنهاء الحصة - بدون sessionId)
// ═══════════════════════════════════════════════════════════════

export const endSession = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { notes } = req.body;  // بدون sessionId

    // Get active session automatically
    const session = await getActiveSession(teacherId!, schoolId!);

    if (!session) {
        throw new BadRequest('لا توجد حصة مفتوحة');
    }

    // Update session
    const updatedSession = await TeacherSession.findByIdAndUpdate(
        session._id,
        {
            $set: {
                status: 'completed',
                endedAt: new Date(),
                notes: notes || null,
            },
        },
        { new: true }
    )
        .populate('class', 'name')
        .populate('grade', 'name nameEn')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime');

    // Calculate duration in minutes
    const duration = Math.round(
        (new Date().getTime() - session.startedAt.getTime()) / 60000
    );

    return SuccessResponse(res, {
        session: updatedSession,
        duration,
        message: 'تم إنهاء الحصة بنجاح'
    });
};

// ═══════════════════════════════════════════════════════════════
// ❌ CANCEL SESSION (إلغاء الحصة - بدون sessionId)
// ═══════════════════════════════════════════════════════════════

export const cancelSession = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;

    // Get active session automatically
    const session = await getActiveSession(teacherId!, schoolId!);

    if (!session) {
        throw new BadRequest('لا توجد حصة مفتوحة');
    }

    // Delete attendance records for this session
    await Attendance.deleteMany({ session: session._id });

    // Delete homework for this session
    await Homework.deleteMany({ session: session._id });

    // Update session status
    await TeacherSession.findByIdAndUpdate(session._id, {
        $set: {
            status: 'cancelled',
            endedAt: new Date(),
        },
    });

    return SuccessResponse(res, {
        message: 'تم إلغاء الحصة'
    });
};

// ═══════════════════════════════════════════════════════════════
// 📚 UPLOAD HOMEWORK (رفع واجب - بدون classId/gradeId/subjectId)
// ═══════════════════════════════════════════════════════════════

export const uploadHomework = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { title, description, file, dueDate } = req.body;  // بدون IDs

    // Get active session automatically
    const session = await getActiveSession(teacherId!, schoolId!);

    if (!session) {
        throw new BadRequest('لا توجد حصة مفتوحة');
    }

    // Handle file upload
    let fileUrl = null;
    let fileType = null;

    if (file) {
        const uniqueId = new Date().getTime().toString();
        fileUrl = await saveBase64Image(file, uniqueId, req, 'homework');

        // Detect file type
        if (file.startsWith('data:application/pdf')) {
            fileType = 'pdf';
        } else if (file.startsWith('data:image')) {
            fileType = 'image';
        } else if (file.includes('word') || file.includes('document')) {
            fileType = 'word';
        } else {
            fileType = 'other';
        }
    }

    // Create homework using session data
    const homeworkRecord = await Homework.create({
        school: schoolId,
        teacher: teacherId,
        session: session._id,
        class: session.class,      // من السيشن
        grade: session.grade,      // من السيشن
        subject: session.subject,  // من السيشن
        title,
        description: description || null,
        file: fileUrl,
        fileType,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'active',
    });

    await homeworkRecord.populate('class', 'name');
    await homeworkRecord.populate('grade', 'name nameEn');
    await homeworkRecord.populate('subject', 'name nameEn');

    return SuccessResponse(res, {
        homework: homeworkRecord,
        message: 'تم رفع الواجب بنجاح'
    }, 201);
};

// ═══════════════════════════════════════════════════════════════
// 📜 GET MY SESSIONS HISTORY (سجل الحصص)
// ═══════════════════════════════════════════════════════════════

export const getMySessionsHistory = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { startDate, endDate, classId, page = 1, limit = 10 } = req.query;

    const query: any = {
        school: schoolId,
        teacher: teacherId,
        status: { $in: ['completed', 'cancelled'] },  // بدون active
    };

    // Date filter
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate as string);
        if (endDate) query.date.$lte = new Date(endDate as string);
    }

    if (classId) query.class = classId;

    const skip = (Number(page) - 1) * Number(limit);

    const [sessions, total] = await Promise.all([
        TeacherSession.find(query)
            .populate('class', 'name')
            .populate('grade', 'name nameEn')
            .populate('subject', 'name nameEn')
            .populate('period', 'name startTime endTime')
            .sort({ date: -1, startedAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        TeacherSession.countDocuments(query),
    ]);

    return SuccessResponse(res, {
        sessions,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    });
};

// ═══════════════════════════════════════════════════════════════
// 🏫 GET MY CLASSES (فصولي)
// ═══════════════════════════════════════════════════════════════

export const getMyClasses = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;

    // Get unique classes from schedule
    const schedules = await Schedule.find({
        school: schoolId,
        teacher: teacherId,
        status: 'active',
    })
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn');

    // Get unique classes with their subjects
    const classesMap = new Map();
    schedules.forEach(schedule => {
        const classId = (schedule.class as any)._id.toString();
        if (!classesMap.has(classId)) {
            classesMap.set(classId, {
                class: schedule.class,
                grade: schedule.grade,
                subjects: [],
            });
        }
        // Add subject if not exists
        const subjects = classesMap.get(classId).subjects;
        const subjectId = (schedule.subject as any)._id.toString();
        if (!subjects.find((s: any) => s._id.toString() === subjectId)) {
            subjects.push(schedule.subject);
        }
    });

    const classes = Array.from(classesMap.values());

    return SuccessResponse(res, {
        classes,
        count: classes.length,
    });
};
