"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyClasses = exports.getMySessionsHistory = exports.uploadHomework = exports.cancelSession = exports.endSession = exports.recordAttendance = exports.startSession = exports.getMyActiveSession = void 0;
const BadRequest_1 = require("../../../Errors/BadRequest");
const NotFound_1 = require("../../../Errors/NotFound");
const Schedule_1 = __importDefault(require("../../../models/schema/admin/Schedule"));
const teachersession_1 = __importDefault(require("../../../models/schema/user/teachersession"));
const Student_1 = __importDefault(require("../../../models/schema/admin/Student"));
const response_1 = require("../../../utils/response");
const Attendance_1 = __importDefault(require("../../../models/schema/admin/Attendance"));
const homework_1 = __importDefault(require("../../../models/schema/user/homework"));
const handleImages_1 = require("../../../utils/handleImages");
// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Get Teacher's Active Session
// ═══════════════════════════════════════════════════════════════
const getActiveSession = async (teacherId, schoolId) => {
    return await teachersession_1.default.findOne({
        teacher: teacherId,
        school: schoolId,
        status: 'active',
    });
};
// ═══════════════════════════════════════════════════════════════
// 🎯 GET MY ACTIVE SESSION (الحصة الشغالة)
// ═══════════════════════════════════════════════════════════════
const getMyActiveSession = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const session = await teachersession_1.default.findOne({
        school: schoolId,
        teacher: teacherId,
        status: 'inprogress',
    })
        .populate('class', 'name')
        .populate('grade', 'name nameEn')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime');
    if (!session) {
        return (0, response_1.SuccessResponse)(res, {
            hasActiveSession: false,
            session: null,
            students: [],
        });
    }
    // Get students with attendance
    const students = await Student_1.default.find({
        school: schoolId,
        classId: session.class,
        status: 'active',
    })
        .select('name nameEn studentCode avatar gender')
        .sort({ name: 1 });
    const attendance = await Attendance_1.default.find({
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
                ? {
                    status: att.status,
                    notes: att.notes,
                }
                : null,
        };
    });
    return (0, response_1.SuccessResponse)(res, {
        hasActiveSession: true,
        session,
        students: studentsWithAttendance,
        studentsCount: students.length,
    });
};
exports.getMyActiveSession = getMyActiveSession;
// ═══════════════════════════════════════════════════════════════
// ▶️ START SESSION (بدء الحصة)
// ═══════════════════════════════════════════════════════════════
const startSession = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { scheduleId } = req.body;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    // Check if teacher already has inprogress session
    const existingActive = await teachersession_1.default.findOne({
        teacher: teacherId,
        school: schoolId,
        status: 'inprogress',
    });
    if (existingActive) {
        // ✅ لو نفس الحصة اللي شغالة → يرجع بياناتها (يكمل عليها)
        if (existingActive.schedule.toString() === scheduleId) {
            // Get students
            const students = await Student_1.default.find({
                school: schoolId,
                classId: existingActive.class,
                status: 'active',
            })
                .select('name nameEn studentCode avatar gender')
                .sort({ name: 1 });
            // Get attendance
            const attendance = await Attendance_1.default.find({
                session: existingActive._id,
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
            // Populate session
            await existingActive.populate('class', 'name');
            await existingActive.populate('grade', 'name nameEn');
            await existingActive.populate('subject', 'name nameEn');
            await existingActive.populate('period', 'name startTime endTime');
            return (0, response_1.SuccessResponse)(res, {
                session: existingActive,
                students: studentsWithAttendance,
                studentsCount: students.length,
                message: 'تم استرجاع الحصة الشغالة',
                isResumed: true, // ✅ علشان الفرونت يعرف إنها مش جديدة
            });
        }
        // ❌ لو حصة تانية شغالة → Error
        throw new BadRequest_1.BadRequest('لديك حصة شغالة بالفعل، يجب إنهاؤها أولاً');
    }
    // Get schedule
    const schedule = await Schedule_1.default.findOne({
        _id: scheduleId,
        school: schoolId,
        teacher: teacherId,
        status: 'active',
    }).populate('period', 'name startTime endTime');
    if (!schedule) {
        throw new NotFound_1.NotFound('الحصة غير موجودة');
    }
    // Check if today matches
    const today = new Date();
    if (schedule.dayOfWeek !== today.getDay()) {
        throw new BadRequest_1.BadRequest('هذه الحصة ليست اليوم');
    }
    // Check existing session for this schedule today
    let session = await teachersession_1.default.findOne({
        school: schoolId,
        schedule: scheduleId,
        date: { $gte: todayStart, $lte: todayEnd },
    });
    if (session) {
        if (session.status === 'completed') {
            throw new BadRequest_1.BadRequest('الحصة انتهت بالفعل اليوم');
        }
        // Session is pending → update to inprogress
        session.status = 'inprogress';
        session.startedAt = new Date();
        await session.save();
    }
    else {
        // Create new session
        session = await teachersession_1.default.create({
            school: schoolId,
            teacher: teacherId,
            schedule: scheduleId,
            class: schedule.class,
            grade: schedule.grade,
            subject: schedule.subject,
            period: schedule.period,
            date: todayStart,
            startedAt: new Date(),
            status: 'inprogress',
            attendanceCount: { present: 0, absent: 0, late: 0, excused: 0 },
        });
    }
    // Get students
    const students = await Student_1.default.find({
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
    return (0, response_1.SuccessResponse)(res, {
        session,
        students,
        studentsCount: students.length,
        message: 'تم بدء الحصة بنجاح',
    }, 201);
};
exports.startSession = startSession;
// ═══════════════════════════════════════════════════════════════
// 📝 RECORD ATTENDANCE (تسجيل الحضور)
// ═══════════════════════════════════════════════════════════════
const recordAttendance = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { attendance } = req.body;
    const session = await getActiveSession(teacherId, schoolId);
    if (!session) {
        throw new BadRequest_1.BadRequest('لا توجد حصة شغالة');
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendanceRecords = [];
    const errors = [];
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };
    for (const record of attendance) {
        try {
            const student = await Student_1.default.findOne({
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
            const attendanceRecord = await Attendance_1.default.findOneAndUpdate({
                school: schoolId,
                student: record.studentId,
                session: session._id,
                date: today,
            }, {
                $set: {
                    class: session.class,
                    grade: session.grade,
                    status: record.status,
                    recordedBy: teacherId,
                    recordedByModel: 'Teacher',
                    notes: record.notes || null,
                },
            }, { upsert: true, new: true });
            attendanceRecords.push(attendanceRecord);
            counts[record.status]++;
        }
        catch (error) {
            errors.push({
                studentId: record.studentId,
                error: 'خطأ في حفظ الحضور',
            });
        }
    }
    // Update session attendance count
    await teachersession_1.default.findByIdAndUpdate(session._id, {
        $set: { attendanceCount: counts },
    });
    return (0, response_1.SuccessResponse)(res, {
        saved: attendanceRecords.length,
        errors: errors.length > 0 ? errors : undefined,
        counts,
        message: errors.length > 0
            ? `تم حفظ ${attendanceRecords.length} سجل مع ${errors.length} أخطاء`
            : 'تم تسجيل الحضور بنجاح',
    });
};
exports.recordAttendance = recordAttendance;
// ═══════════════════════════════════════════════════════════════
// ⏹️ END SESSION (إنهاء الحصة)
// ═══════════════════════════════════════════════════════════════
const endSession = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const notes = req.body?.notes || null;
    // ✅ Debug logs
    console.log('=== END SESSION DEBUG ===');
    console.log('teacherId:', teacherId);
    console.log('schoolId:', schoolId);
    console.log('req.user:', req.user);
    const session = await teachersession_1.default.findOne({
        teacher: teacherId,
        school: schoolId,
        status: 'inprogress',
    });
    console.log('Found session:', session);
    if (!session) {
        // ✅ Try to find any session for debugging
        const anySession = await teachersession_1.default.findOne({
            status: 'inprogress',
        });
        console.log('Any inprogress session:', anySession);
        throw new BadRequest_1.BadRequest('لا توجد حصة شغالة');
    }
    const updatedSession = await teachersession_1.default.findByIdAndUpdate(session._id, {
        $set: {
            status: 'completed',
            endedAt: new Date(),
            notes: notes || null,
        },
    }, { new: true })
        .populate('class', 'name')
        .populate('grade', 'name nameEn')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime');
    const duration = session.startedAt
        ? Math.round((new Date().getTime() - session.startedAt.getTime()) / 60000)
        : 0;
    return (0, response_1.SuccessResponse)(res, {
        session: updatedSession,
        duration,
        message: 'تم إنهاء الحصة بنجاح',
    });
};
exports.endSession = endSession;
// ═══════════════════════════════════════════════════════════════
// ❌ CANCEL SESSION (إلغاء الحصة)
// ═══════════════════════════════════════════════════════════════
const cancelSession = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const session = await getActiveSession(teacherId, schoolId);
    if (!session) {
        throw new BadRequest_1.BadRequest('لا توجد حصة شغالة');
    }
    // Delete related records
    await Attendance_1.default.deleteMany({ session: session._id });
    await homework_1.default.deleteMany({ session: session._id });
    // Update session
    await teachersession_1.default.findByIdAndUpdate(session._id, {
        $set: {
            status: 'pending',
            startedAt: null,
        },
    });
    return (0, response_1.SuccessResponse)(res, {
        message: 'تم إلغاء الحصة',
    });
};
exports.cancelSession = cancelSession;
// ═══════════════════════════════════════════════════════════════
// 📚 UPLOAD HOMEWORK (رفع واجب)
// ═══════════════════════════════════════════════════════════════
const uploadHomework = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { title, description, file, dueDate } = req.body;
    const session = await getActiveSession(teacherId, schoolId);
    if (!session) {
        throw new BadRequest_1.BadRequest('لا توجد حصة شغالة');
    }
    let fileUrl = null;
    let fileType = null;
    if (file) {
        const uniqueId = new Date().getTime().toString();
        fileUrl = await (0, handleImages_1.saveBase64Image)(file, uniqueId, req, 'homework');
        if (file.startsWith('data:application/pdf')) {
            fileType = 'pdf';
        }
        else if (file.startsWith('data:image')) {
            fileType = 'image';
        }
        else if (file.includes('word') || file.includes('document')) {
            fileType = 'word';
        }
        else {
            fileType = 'other';
        }
    }
    const homeworkRecord = await homework_1.default.create({
        school: schoolId,
        teacher: teacherId,
        session: session._id,
        class: session.class,
        grade: session.grade,
        subject: session.subject,
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
    return (0, response_1.SuccessResponse)(res, {
        homework: homeworkRecord,
        message: 'تم رفع الواجب بنجاح',
    }, 201);
};
exports.uploadHomework = uploadHomework;
// ═══════════════════════════════════════════════════════════════
// 📜 GET SESSIONS HISTORY (سجل الحصص)
// ═══════════════════════════════════════════════════════════════
const getMySessionsHistory = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const { startDate, endDate, classId, status, page = 1, limit = 10 } = req.query;
    const query = {
        school: schoolId,
        teacher: teacherId,
    };
    if (startDate || endDate) {
        query.date = {};
        if (startDate)
            query.date.$gte = new Date(startDate);
        if (endDate)
            query.date.$lte = new Date(endDate);
    }
    if (classId)
        query.class = classId;
    if (status)
        query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [sessions, total] = await Promise.all([
        teachersession_1.default.find(query)
            .populate('class', 'name')
            .populate('grade', 'name nameEn')
            .populate('subject', 'name nameEn')
            .populate('period', 'name startTime endTime')
            .sort({ date: -1, startedAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        teachersession_1.default.countDocuments(query),
    ]);
    return (0, response_1.SuccessResponse)(res, {
        sessions,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    });
};
exports.getMySessionsHistory = getMySessionsHistory;
// ═══════════════════════════════════════════════════════════════
// 🏫 GET MY CLASSES (فصولي)
// ═══════════════════════════════════════════════════════════════
const getMyClasses = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const schedules = await Schedule_1.default.find({
        school: schoolId,
        teacher: teacherId,
        status: 'active',
    })
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn');
    const classesMap = new Map();
    schedules.forEach(schedule => {
        const classId = schedule.class._id.toString();
        if (!classesMap.has(classId)) {
            classesMap.set(classId, {
                class: schedule.class,
                grade: schedule.grade,
                subjects: [],
            });
        }
        const subjects = classesMap.get(classId).subjects;
        const subjectId = schedule.subject._id.toString();
        if (!subjects.find((s) => s._id.toString() === subjectId)) {
            subjects.push(schedule.subject);
        }
    });
    const classes = Array.from(classesMap.values());
    return (0, response_1.SuccessResponse)(res, {
        classes,
        count: classes.length,
    });
};
exports.getMyClasses = getMyClasses;
