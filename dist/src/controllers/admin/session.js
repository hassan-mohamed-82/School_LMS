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
const getClassAttendanceByDate = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { classId, date } = req.body;
    if (!classId) {
        throw new BadRequest_1.BadRequest('معرف الفصل مطلوب');
    }
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);
    // Get all students in class
    const students = await Student_1.default.find({
        school: schoolId,
        classId: classId,
        status: 'active',
    }).select('name nameEn studentCode gender');
    // Get attendance for this date
    const attendanceRecords = await Attendance_1.default.find({
        school: schoolId,
        class: classId,
        date: { $gte: targetDate, $lte: targetDateEnd },
    }).populate('recordedBy', 'name');
    const attendanceMap = new Map(attendanceRecords.map(a => [a.student.toString(), a]));
    // Merge students with attendance
    const studentsWithAttendance = students.map(student => {
        const att = attendanceMap.get(student._id.toString());
        return {
            _id: student._id,
            name: student.name,
            nameEn: student.nameEn,
            studentCode: student.studentCode,
            gender: student.gender,
            status: att?.status || 'not_recorded',
            notes: att?.notes || null,
            recordedBy: att?.recordedBy || null,
        };
    });
    // Summary
    const summary = {
        total: students.length,
        present: studentsWithAttendance.filter(s => s.status === 'present').length,
        absent: studentsWithAttendance.filter(s => s.status === 'absent').length,
        late: studentsWithAttendance.filter(s => s.status === 'late').length,
        excused: studentsWithAttendance.filter(s => s.status === 'excused').length,
        notRecorded: studentsWithAttendance.filter(s => s.status === 'not_recorded').length,
    };
    return (0, response_1.SuccessResponse)(res, {
        classId,
        date: targetDate.toISOString().split('T')[0],
        summary,
        students: studentsWithAttendance,
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
    if (startDate || endDate) {
        query.date = {};
        if (startDate)
            query.date.$gte = new Date(startDate);
        if (endDate)
            query.date.$lte = new Date(endDate);
    }
    const records = await Attendance_1.default.find(query)
        .populate('recordedBy', 'name')
        .populate('session', 'subject period')
        .sort({ date: -1 });
    // Summary
    const allRecords = await Attendance_1.default.find({
        school: schoolId,
        student: studentId,
        ...(startDate || endDate ? { date: query.date } : {}),
    });
    const summary = {
        totalDays: allRecords.length,
        present: allRecords.filter(r => r.status === 'present').length,
        absent: allRecords.filter(r => r.status === 'absent').length,
        attendanceRate: allRecords.length > 0
            ? Math.round((allRecords.filter(r => r.status === 'present').length / allRecords.length) * 100)
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
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    // Get all students
    const students = await Student_1.default.find({
        school: schoolId,
        classId: classId,
        status: 'active',
    }).select('name nameEn studentCode');
    // Get all attendance in period
    const attendanceRecords = await Attendance_1.default.find({
        school: schoolId,
        class: classId,
        date: { $gte: start, $lte: end },
    });
    // Build report for each student
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
    // Sort by attendance rate
    report.sort((a, b) => b.attendance.rate - a.attendance.rate);
    // Overall summary
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
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
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
    if (startDate || endDate) {
        query.date = {};
        if (startDate)
            query.date.$gte = new Date(startDate);
        if (endDate)
            query.date.$lte = new Date(endDate);
    }
    if (status)
        query.status = status;
    const sessions = await teachersession_1.default.find(query)
        .populate('class', 'name')
        .populate('grade', 'name nameEn')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime')
        .sort({ date: -1, startedAt: -1 });
    // Summary
    const summaryQuery = {
        school: schoolId,
        teacher: teacherId,
    };
    if (startDate || endDate) {
        summaryQuery.date = query.date;
    }
    const allSessions = await teachersession_1.default.find(summaryQuery);
    const summary = {
        total: allSessions.length,
        completed: allSessions.filter(s => s.status === 'completed').length,
        inprogress: allSessions.filter(s => s.status === 'inprogress').length,
        pending: allSessions.filter(s => s.status === 'pending').length,
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
    // Get attendance
    const attendance = await Attendance_1.default.find({
        session: sessionId,
    }).populate('student', 'name nameEn studentCode');
    // Get homework
    const homework = await homework_1.default.find({
        session: sessionId,
    });
    // Duration
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
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const sessions = await teachersession_1.default.find({
        school: schoolId,
        date: { $gte: todayStart, $lte: todayEnd },
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
    // Group by status
    const byStatus = {
        inprogress: sessions.filter(s => s.status === 'inprogress'),
        pending: sessions.filter(s => s.status === 'pending'),
        completed: sessions.filter(s => s.status === 'completed'),
    };
    return (0, response_1.SuccessResponse)(res, {
        date: todayStart.toISOString().split('T')[0],
        summary,
        sessions: byStatus,
    });
};
exports.getTodaySessionsOverview = getTodaySessionsOverview;
