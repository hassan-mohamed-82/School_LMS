"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodaySessionsOverview = exports.getSessionDetails = exports.getTeacherSessions = exports.getClassAttendanceReport = exports.getStudentAttendanceHistory = exports.getClassAttendanceByDate = void 0;
const teachersession_1 = __importDefault(require("../../models/schema/user/teachersession"));
const Attendance_1 = __importDefault(require("../../models/schema/admin/Attendance"));
const Student_1 = __importDefault(require("../../models/schema/admin/Student"));
const homework_1 = __importDefault(require("../../models/schema/user/homework"));
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
const date_Egypt_1 = require("../../utils/date_Egypt");
const Class_1 = __importDefault(require("../../models/schema/admin/Class"));
// ═══════════════════════════════════════════════════════════════
// 📊 GET CLASS ATTENDANCE BY DATE (حضور فصل في يوم معين)
// ═══════════════════════════════════════════════════════════════
const getClassAttendanceByDate = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { classId, date } = req.body;
    // استخدام نوع موحد
    const dateRange = date ? (0, date_Egypt_1.getDateRange)(date) : (0, date_Egypt_1.getTodayRange)();
    const { dayStart, dayEnd, dateString, dayName } = dateRange;
    // Get class
    const classDoc = await Class_1.default.findOne({
        _id: classId,
        school: schoolId,
    }).populate('grade', 'name nameEn');
    if (!classDoc) {
        throw new Errors_1.NotFound('الفصل غير موجود');
    }
    // Get students
    const students = await Student_1.default.find({
        school: schoolId,
        classId: classId,
        status: 'active',
    })
        .select('name nameEn studentCode avatar gender')
        .sort({ name: 1 });
    // Get attendance records
    const attendanceRecords = await Attendance_1.default.find({
        school: schoolId,
        class: classId,
        date: { $gte: dayStart, $lte: dayEnd },
    }).populate('session', 'subject period');
    // Map attendance
    const attendanceMap = new Map();
    attendanceRecords.forEach((record) => {
        attendanceMap.set(record.student.toString(), record);
    });
    // Merge
    const studentsWithAttendance = students.map((student) => {
        const attendance = attendanceMap.get(student._id.toString());
        return {
            student: {
                _id: student._id,
                name: student.name,
                nameEn: student.nameEn,
                studentCode: student.studentCode,
                avatar: student.avatar,
                gender: student.gender,
            },
            attendance: attendance
                ? {
                    status: attendance.status,
                    notes: attendance.notes,
                    recordedAt: attendance.createdAt,
                }
                : null,
        };
    });
    // Summary
    const summary = {
        total: students.length,
        present: attendanceRecords.filter((a) => a.status === 'present').length,
        absent: attendanceRecords.filter((a) => a.status === 'absent').length,
        notRecorded: students.length - attendanceRecords.length,
    };
    return (0, response_1.SuccessResponse)(res, {
        class: classDoc,
        date: dateString,
        dayName,
        students: studentsWithAttendance,
        summary,
    });
};
exports.getClassAttendanceByDate = getClassAttendanceByDate;
// ═══════════════════════════════════════════════════════════════
// 📊 GET STUDENT ATTENDANCE HISTORY (سجل حضور طالب)
// ═══════════════════════════════════════════════════════════════
const getStudentAttendanceHistory = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { studentId, startDate, endDate } = req.body;
    if (!studentId) {
        throw new BadRequest_1.BadRequest('معرف الطالب مطلوب');
    }
    const student = await Student_1.default.findOne({
        _id: studentId,
        school: schoolId,
    }).select('name nameEn studentCode classId gradeId');
    if (!student) {
        throw new Errors_1.NotFound('الطالب غير موجود');
    }
    const query = {
        school: schoolId,
        student: studentId,
    };
    // ✅ استخدم الـ Helper للتواريخ
    if (startDate || endDate) {
        query.date = {};
        if (startDate) {
            const { dayStart } = (0, date_Egypt_1.getDateRange)(startDate);
            query.date.$gte = dayStart;
        }
        if (endDate) {
            const { dayEnd } = (0, date_Egypt_1.getDateRange)(endDate);
            query.date.$lte = dayEnd;
        }
    }
    const records = await Attendance_1.default.find(query)
        .populate('recordedBy', 'name')
        .populate('session', 'subject period')
        .sort({ date: -1 });
    const summary = {
        totalDays: records.length,
        present: records.filter(r => r.status === 'present').length,
        absent: records.filter(r => r.status === 'absent').length,
        attendanceRate: records.length > 0
            ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 100)
            : 0,
    };
    return (0, response_1.SuccessResponse)(res, {
        student,
        summary,
        records,
    });
};
exports.getStudentAttendanceHistory = getStudentAttendanceHistory;
// ═══════════════════════════════════════════════════════════════
// 📊 GET CLASS ATTENDANCE REPORT (تقرير حضور فصل لفترة)
// ═══════════════════════════════════════════════════════════════
const getClassAttendanceReport = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { classId, startDate, endDate } = req.body;
    if (!classId) {
        throw new BadRequest_1.BadRequest('معرف الفصل مطلوب');
    }
    if (!startDate || !endDate) {
        throw new BadRequest_1.BadRequest('تاريخ البداية والنهاية مطلوبين');
    }
    // ✅ استخدم الـ Helper
    const { dayStart: start, dateString: startString } = (0, date_Egypt_1.getDateRange)(startDate);
    const { dayEnd: end, dateString: endString } = (0, date_Egypt_1.getDateRange)(endDate);
    const students = await Student_1.default.find({
        school: schoolId,
        classId: classId,
        status: 'active',
    }).select('name nameEn studentCode');
    const attendanceRecords = await Attendance_1.default.find({
        school: schoolId,
        class: classId,
        date: { $gte: start, $lte: end },
    });
    const report = students.map(student => {
        const studentRecords = attendanceRecords.filter(r => r.student.toString() === student._id.toString());
        const present = studentRecords.filter(r => r.status === 'present').length;
        const absent = studentRecords.filter(r => r.status === 'absent').length;
        const total = studentRecords.length;
        return {
            _id: student._id,
            name: student.name,
            nameEn: student.nameEn,
            studentCode: student.studentCode,
            attendance: {
                present,
                absent,
                total,
                rate: total > 0 ? Math.round((present / total) * 100) : 0,
            },
        };
    });
    report.sort((a, b) => b.attendance.rate - a.attendance.rate);
    const totalRecords = attendanceRecords.length;
    const overallSummary = {
        totalStudents: students.length,
        totalRecords,
        present: attendanceRecords.filter(r => r.status === 'present').length,
        absent: attendanceRecords.filter(r => r.status === 'absent').length,
        averageRate: report.length > 0
            ? Math.round(report.reduce((sum, r) => sum + r.attendance.rate, 0) / report.length)
            : 0,
    };
    return (0, response_1.SuccessResponse)(res, {
        classId,
        period: {
            startDate: startString,
            endDate: endString,
        },
        overallSummary,
        students: report,
    });
};
exports.getClassAttendanceReport = getClassAttendanceReport;
// ═══════════════════════════════════════════════════════════════
// 📊 GET TEACHER SESSIONS (حصص مدرس)
// ═══════════════════════════════════════════════════════════════
const getTeacherSessions = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { teacherId, startDate, endDate, status } = req.body;
    if (!teacherId) {
        throw new BadRequest_1.BadRequest('معرف المدرس مطلوب');
    }
    const query = {
        school: schoolId,
        teacher: teacherId,
    };
    // ✅ استخدم الـ Helper للتواريخ
    if (startDate || endDate) {
        query.date = {};
        if (startDate) {
            const { dayStart } = (0, date_Egypt_1.getDateRange)(startDate);
            query.date.$gte = dayStart;
        }
        if (endDate) {
            const { dayEnd } = (0, date_Egypt_1.getDateRange)(endDate);
            query.date.$lte = dayEnd;
        }
    }
    if (status)
        query.status = status;
    const sessions = await teachersession_1.default.find(query)
        .populate('class', 'name')
        .populate('grade', 'name nameEn')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime')
        .sort({ date: -1, startedAt: -1 });
    const summary = {
        total: sessions.length,
        completed: sessions.filter(s => s.status === 'completed').length,
        inprogress: sessions.filter(s => s.status === 'inprogress').length,
        pending: sessions.filter(s => s.status === 'pending').length,
    };
    return (0, response_1.SuccessResponse)(res, {
        teacherId,
        summary,
        sessions,
    });
};
exports.getTeacherSessions = getTeacherSessions;
// ═══════════════════════════════════════════════════════════════
// 📊 GET SESSION DETAILS (تفاصيل حصة)
// ═══════════════════════════════════════════════════════════════
const getSessionDetails = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { sessionId } = req.body;
    if (!sessionId) {
        throw new BadRequest_1.BadRequest('معرف الحصة مطلوب');
    }
    const session = await teachersession_1.default.findOne({
        _id: sessionId,
        school: schoolId,
    })
        .populate('teacher', 'name phone')
        .populate('class', 'name')
        .populate('grade', 'name nameEn')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime');
    if (!session) {
        throw new Errors_1.NotFound('الحصة غير موجودة');
    }
    const attendance = await Attendance_1.default.find({
        session: sessionId,
    }).populate('student', 'name nameEn studentCode');
    const homework = await homework_1.default.find({
        session: sessionId,
    });
    let duration = null;
    if (session.startedAt && session.endedAt) {
        duration = Math.round((session.endedAt.getTime() - session.startedAt.getTime()) / 60000);
    }
    return (0, response_1.SuccessResponse)(res, {
        session: {
            ...session.toObject(),
            duration,
        },
        attendance,
        homework,
    });
};
exports.getSessionDetails = getSessionDetails;
// ═══════════════════════════════════════════════════════════════
// 📊 GET TODAY'S SESSIONS OVERVIEW (نظرة عامة على حصص اليوم)
// ═══════════════════════════════════════════════════════════════
const getTodaySessionsOverview = async (req, res) => {
    const schoolId = req.user?.schoolId;
    // ✅ استخدم الـ Helper
    const { dayStart, dayEnd, date } = (0, date_Egypt_1.getTodayRange)();
    const sessions = await teachersession_1.default.find({
        school: schoolId,
        date: { $gte: dayStart, $lte: dayEnd },
    })
        .populate('teacher', 'name')
        .populate('class', 'name')
        .populate('grade', 'name')
        .populate('subject', 'name')
        .populate('period', 'name startTime endTime')
        .sort({ 'period.sortOrder': 1 });
    const summary = {
        total: sessions.length,
        completed: sessions.filter(s => s.status === 'completed').length,
        inprogress: sessions.filter(s => s.status === 'inprogress').length,
        pending: sessions.filter(s => s.status === 'pending').length,
    };
    const byStatus = {
        inprogress: sessions.filter(s => s.status === 'inprogress'),
        pending: sessions.filter(s => s.status === 'pending'),
        completed: sessions.filter(s => s.status === 'completed'),
    };
    return (0, response_1.SuccessResponse)(res, {
        date,
        summary,
        sessions: byStatus,
    });
};
exports.getTodaySessionsOverview = getTodaySessionsOverview;
