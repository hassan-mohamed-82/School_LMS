import { Request, Response } from 'express';
import TeacherSession from '../../models/schema/user/teachersession';
import Attendance from '../../models/schema/admin/Attendance';
import Student from '../../models/schema/admin/Student';
import Schedule from '../../models/schema/admin/Schedule';
import Homework from '../../models/schema/user/homework';
import { SuccessResponse } from '../../utils/response';
import { NotFound } from '../../Errors';
import { BadRequest } from '../../Errors/BadRequest';
import { getTodayRange, getDateRange, IDateRange } from '../../utils/date_Egypt';
import Class from '../../models/schema/admin/Class';

// ═══════════════════════════════════════════════════════════════
// 📊 GET CLASS ATTENDANCE BY DATE (حضور فصل في يوم معين)
// ═══════════════════════════════════════════════════════════════


export const getClassAttendanceByDate = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { classId, date } = req.body;

    // استخدام نوع موحد
    const dateRange: IDateRange = date ? getDateRange(date) : getTodayRange();
    const { dayStart, dayEnd, dateString, dayName } = dateRange;

    // Get class
    const classDoc = await Class.findOne({
        _id: classId,
        school: schoolId,
    }).populate('grade', 'name nameEn');

    if (!classDoc) {
        throw new NotFound('الفصل غير موجود');
    }

    // Get students
    const students = await Student.find({
        school: schoolId,
        classId: classId,
        status: 'active',
    })
        .select('name nameEn studentCode avatar gender')
        .sort({ name: 1 });

    // Get attendance records
    const attendanceRecords = await Attendance.find({
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

    return SuccessResponse(res, {
        class: classDoc,
        date: dateString,
        dayName,
        students: studentsWithAttendance,
        summary,
    });
};

// ═══════════════════════════════════════════════════════════════
// 📊 GET STUDENT ATTENDANCE HISTORY (سجل حضور طالب)
// ═══════════════════════════════════════════════════════════════

export const getStudentAttendanceHistory = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { studentId, startDate, endDate } = req.body;

    if (!studentId) {
        throw new BadRequest('معرف الطالب مطلوب');
    }

    const student = await Student.findOne({
        _id: studentId,
        school: schoolId,
    }).select('name nameEn studentCode classId gradeId');

    if (!student) {
        throw new NotFound('الطالب غير موجود');
    }

    const query: any = {
        school: schoolId,
        student: studentId,
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

    const records = await Attendance.find(query)
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

    return SuccessResponse(res, {
        student,
        summary,
        records,
    });
};

// ═══════════════════════════════════════════════════════════════
// 📊 GET CLASS ATTENDANCE REPORT (تقرير حضور فصل لفترة)
// ═══════════════════════════════════════════════════════════════

export const getClassAttendanceReport = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { classId, startDate, endDate } = req.body;

    if (!classId) {
        throw new BadRequest('معرف الفصل مطلوب');
    }

    if (!startDate || !endDate) {
        throw new BadRequest('تاريخ البداية والنهاية مطلوبين');
    }

    // ✅ استخدم الـ Helper
    const { dayStart: start, dateString: startString } = getDateRange(startDate);
    const { dayEnd: end, dateString: endString } = getDateRange(endDate);

    const students = await Student.find({
        school: schoolId,
        classId: classId,
        status: 'active',
    }).select('name nameEn studentCode');

    const attendanceRecords = await Attendance.find({
        school: schoolId,
        class: classId,
        date: { $gte: start, $lte: end },
    });

    const report = students.map(student => {
        const studentRecords = attendanceRecords.filter(
            r => r.student.toString() === student._id.toString()
        );

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

    return SuccessResponse(res, {
        classId,
        period: {
            startDate: startString,
            endDate: endString,
        },
        overallSummary,
        students: report,
    });
};

// ═══════════════════════════════════════════════════════════════
// 📊 GET TEACHER SESSIONS (حصص مدرس)
// ═══════════════════════════════════════════════════════════════

export const getTeacherSessions = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { teacherId, startDate, endDate, status } = req.body;

    if (!teacherId) {
        throw new BadRequest('معرف المدرس مطلوب');
    }

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

    if (status) query.status = status;

    const sessions = await TeacherSession.find(query)
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

    return SuccessResponse(res, {
        teacherId,
        summary,
        sessions,
    });
};

// ═══════════════════════════════════════════════════════════════
// 📊 GET SESSION DETAILS (تفاصيل حصة)
// ═══════════════════════════════════════════════════════════════

export const getSessionDetails = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { sessionId } = req.body;

    if (!sessionId) {
        throw new BadRequest('معرف الحصة مطلوب');
    }

    const session = await TeacherSession.findOne({
        _id: sessionId,
        school: schoolId,
    })
        .populate('teacher', 'name phone')
        .populate('class', 'name')
        .populate('grade', 'name nameEn')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime');

    if (!session) {
        throw new NotFound('الحصة غير موجودة');
    }

    const attendance = await Attendance.find({
        session: sessionId,
    }).populate('student', 'name nameEn studentCode');

    const homework = await Homework.find({
        session: sessionId,
    });

    let duration = null;
    if (session.startedAt && session.endedAt) {
        duration = Math.round(
            (session.endedAt.getTime() - session.startedAt.getTime()) / 60000
        );
    }

    return SuccessResponse(res, {
        session: {
            ...session.toObject(),
            duration,
        },
        attendance,
        homework,
    });
};

// ═══════════════════════════════════════════════════════════════
// 📊 GET TODAY'S SESSIONS OVERVIEW (نظرة عامة على حصص اليوم)
// ═══════════════════════════════════════════════════════════════

export const getTodaySessionsOverview = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;

    // ✅ استخدم الـ Helper
    const { dayStart, dayEnd, date } = getTodayRange();

    const sessions = await TeacherSession.find({
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

    return SuccessResponse(res, {
        date,
        summary,
        sessions: byStatus,
    });
};
