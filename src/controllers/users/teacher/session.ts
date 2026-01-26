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
import { getTodayRange, getDateRange } from "../../../utils/date_Egypt";
import { uploadBufferToCloudinary } from "../../../utils/cloudinary";

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Get Teacher's Active Session
// ═══════════════════════════════════════════════════════════════

const getActiveSession = async (teacherId: string, schoolId: string) => {
    return await TeacherSession.findOne({
        teacher: teacherId,
        school: schoolId,
        status: 'inprogress',
    });
};

// ═══════════════════════════════════════════════════════════════
// 🎯 GET MY ACTIVE SESSION (الحصة الشغالة)
// ═══════════════════════════════════════════════════════════════

export const getMyActiveSession = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;

    const session = await TeacherSession.findOne({
        school: schoolId,
        teacher: teacherId,
        status: 'inprogress',
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

    // Get students with attendance
    const students = await Student.find({
        school: schoolId,
        classId: session.class,
        status: 'active',
    })
        .select('name nameEn studentCode avatar gender')
        .sort({ name: 1 });

    const attendance = await Attendance.find({
        school: schoolId,
        session: session._id,
    });

    const attendanceMap = new Map(attendance.map(a => [a.student.toString(), a]));

    const studentsWithAttendance = students.map(student => {
        const att = attendanceMap.get(student._id.toString());
        return {
            _id: student._id,
            name: student.name,
            nameEn: student.nameEn,
            studentCode: student.studentCode,
            avatar: student.avatar,
            gender: student.gender,
            attendance: att
                ? { status: att.status, notes: att.notes }
                : null,
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
// ▶️ START SESSION (بدء الحصة)
// ═══════════════════════════════════════════════════════════════

export const startSession = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { scheduleId } = req.body;

    // ✅ استخدم الـ Helper
    const { dayOfWeek, dayStart, dayEnd } = getTodayRange();

    // Check if teacher already has inprogress session
    const existingActive = await TeacherSession.findOne({
        teacher: teacherId,
        school: schoolId,
        status: 'inprogress',
    });

    if (existingActive) {
        // ✅ لو نفس الحصة اللي شغالة → يرجع بياناتها
        if (existingActive.schedule.toString() === scheduleId) {
            const students = await Student.find({
                school: schoolId,
                classId: existingActive.class,
                status: 'active',
            })
                .select('name nameEn studentCode avatar gender')
                .sort({ name: 1 });

            const attendance = await Attendance.find({
                session: existingActive._id,
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
                    attendance: att
                        ? { status: att.status, notes: att.notes }
                        : null,
                };
            });

            await existingActive.populate('class', 'name');
            await existingActive.populate('grade', 'name nameEn');
            await existingActive.populate('subject', 'name nameEn');
            await existingActive.populate('period', 'name startTime endTime');

            return SuccessResponse(res, {
                session: existingActive,
                students: studentsWithAttendance,
                studentsCount: students.length,
                message: 'تم استرجاع الحصة الشغالة',
                isResumed: true,
            });
        }

        throw new BadRequest('لديك حصة شغالة بالفعل، يجب إنهاؤها أولاً');
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

    // ✅ Check if today matches (using helper)
    if (schedule.dayOfWeek !== dayOfWeek) {
        throw new BadRequest('هذه الحصة ليست اليوم');
    }

    // Check existing session for this schedule today
    let session = await TeacherSession.findOne({
        school: schoolId,
        schedule: scheduleId,
        date: { $gte: dayStart, $lte: dayEnd },
    });

    if (session) {
        if (session.status === 'completed') {
            throw new BadRequest('الحصة انتهت بالفعل اليوم');
        }

        session.status = 'inprogress';
        session.startedAt = new Date();
        await session.save();
    } else {
        session = await TeacherSession.create({
            school: schoolId,
            teacher: teacherId,
            schedule: scheduleId,
            class: schedule.class,
            grade: schedule.grade,
            subject: schedule.subject,
            period: schedule.period,
            date: dayStart,
            startedAt: new Date(),
            status: 'inprogress',
            attendanceCount: { present: 0, absent: 0, late: 0, excused: 0 },
        });
    }

    const students = await Student.find({
        school: schoolId,
        classId: schedule.class,
        status: 'active',
    })
        .select('name nameEn studentCode avatar gender')
        .sort({ name: 1 });

    await session.populate('class', 'name');
    await session.populate('grade', 'name nameEn');
    await session.populate('subject', 'name nameEn');
    await session.populate('period', 'name startTime endTime');

    return SuccessResponse(
        res,
        {
            session,
            students,
            studentsCount: students.length,
            message: 'تم بدء الحصة بنجاح',
            isResumed: false,
        },
        201
    );
};

// ═══════════════════════════════════════════════════════════════
// 📝 RECORD ATTENDANCE (تسجيل الحضور)
// ═══════════════════════════════════════════════════════════════

export const recordAttendance = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { attendance } = req.body;

    const session = await getActiveSession(teacherId!, schoolId!);

    if (!session) {
        throw new BadRequest('لا توجد حصة شغالة');
    }

    // ✅ استخدم الـ Helper
    const { dayStart } = getTodayRange();

    const attendanceRecords = [];
    const errors = [];
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };

    for (const record of attendance) {
        try {
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

            const attendanceRecord = await Attendance.findOneAndUpdate(
                {
                    school: schoolId,
                    student: record.studentId,
                    session: session._id,
                    date: dayStart,
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

    await TeacherSession.findByIdAndUpdate(session._id, {
        $set: { attendanceCount: counts },
    });

    return SuccessResponse(res, {
        saved: attendanceRecords.length,
        errors: errors.length > 0 ? errors : undefined,
        counts,
        message:
            errors.length > 0
                ? `تم حفظ ${attendanceRecords.length} سجل مع ${errors.length} أخطاء`
                : 'تم تسجيل الحضور بنجاح',
    });
};

// ═══════════════════════════════════════════════════════════════
// ⏹️ END SESSION (إنهاء الحصة)
// ═══════════════════════════════════════════════════════════════

export const endSession = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const notes = req.body?.notes || null;

    const session = await getActiveSession(teacherId!, schoolId!);

    if (!session) {
        throw new BadRequest('لا توجد حصة شغالة');
    }

    const updatedSession = await TeacherSession.findByIdAndUpdate(
        session._id,
        {
            $set: {
                status: 'completed',
                endedAt: new Date(),
                notes: notes,
            },
        },
        { new: true }
    )
        .populate('class', 'name')
        .populate('grade', 'name nameEn')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime');

    const duration = session.startedAt
        ? Math.round((new Date().getTime() - session.startedAt.getTime()) / 60000)
        : 0;

    return SuccessResponse(res, {
        session: updatedSession,
        duration,
        message: 'تم إنهاء الحصة بنجاح',
    });
};

// ═══════════════════════════════════════════════════════════════
// ❌ CANCEL SESSION (إلغاء الحصة)
// ═══════════════════════════════════════════════════════════════

export const cancelSession = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;

    const session = await getActiveSession(teacherId!, schoolId!);

    if (!session) {
        throw new BadRequest('لا توجد حصة شغالة');
    }

    await Attendance.deleteMany({ session: session._id });
    await Homework.deleteMany({ session: session._id });

    await TeacherSession.findByIdAndUpdate(session._id, {
        $set: {
            status: 'pending',
            startedAt: null,
        },
    });

    return SuccessResponse(res, {
        message: 'تم إلغاء الحصة',
    });
};

// ═══════════════════════════════════════════════════════════════
// 📚 UPLOAD HOMEWORK (رفع واجب)
// ═══════════════════════════════════════════════════════════════

const getFileType = (mimetype: string): string => {
  if (mimetype === 'application/pdf') {
    return 'pdf';
  } else if (mimetype.startsWith('image/')) {
    return 'image';
  } else if (
    mimetype === 'application/msword' ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'word';
  }
  return 'other';
};

export const uploadHomework = async (req: Request, res: Response) => {
  const schoolId = req.user?.schoolId;
  const teacherId = req.user?.id;
  const { title, description, dueDate } = req.body;
  const session = await getActiveSession(teacherId!, schoolId!);

  if (!session) {
    throw new BadRequest('لا توجد حصة شغالة');
  }

  let fileUrl = null;
  let fileType = null;

  if (req.file) {
    // رفع الـ buffer على Cloudinary
    fileUrl = await uploadBufferToCloudinary(req.file.buffer, 'homework');
    fileType = getFileType(req.file.mimetype);
  }

  const homeworkRecord = await Homework.create({
    school: schoolId,
    teacher: teacherId,
    session: session._id,
    class: session.class,
    grade: session.grade,
    subject: session.subject,
    title,
    description: description || null,
    dueDate: dueDate || null,
    file: fileUrl,
    fileType,
    status: 'active',
  });

  await homeworkRecord.populate('class', 'name');
  await homeworkRecord.populate('grade', 'name nameEn');
  await homeworkRecord.populate('subject', 'name nameEn');

  return SuccessResponse(
    res,
    {
      homework: homeworkRecord,
      message: 'تم رفع الواجب بنجاح',
    },
    201
  );
};

// ═══════════════════════════════════════════════════════════════
// 📜 GET SESSIONS HISTORY (سجل الحصص)
// ═══════════════════════════════════════════════════════════════

export const getMySessionsHistory = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { startDate, endDate, classId, status, page = 1, limit = 10 } = req.body;

    const query: any = {
        school: schoolId,
        teacher: teacherId,
    };

    // ✅ استخدم الـ Helper للتواريخ
    if (startDate || endDate) {
        query.date = {};
        if (startDate) {
            const { dayStart } = getDateRange(startDate);
            query.date.$gte = dayStart;
        }
        if (endDate) {
            const { dayEnd } = getDateRange(endDate);
            query.date.$lte = dayEnd;
        }
    }

    if (classId) query.class = classId;
    if (status) query.status = status;

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

    const schedules = await Schedule.find({
        school: schoolId,
        teacher: teacherId,
        status: 'active',
    })
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn');

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
