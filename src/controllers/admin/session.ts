import { Request, Response } from 'express';
import TeacherSession from '../../models/schema/user/teachersession';
import Attendance from '../../models/schema/admin/Attendance';
import Student from '../../models/schema/admin/Student';
import Schedule from '../../models/schema/admin/Schedule';
import Homework from '../../models/schema/user/homework';
import { SuccessResponse } from '../../utils/response';
import { NotFound } from '../../Errors';
import { BadRequest } from '../../Errors/BadRequest';


export const getClassAttendanceByDate = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { classId, date } = req.body;

    if (!classId) {
        throw new BadRequest('معرف الفصل مطلوب');
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    // Get all students in class
    const students = await Student.find({
        school: schoolId,
        classId: classId,
        status: 'active',
    }).select('name nameEn studentCode gender');

    // Get attendance for this date
    const attendanceRecords = await Attendance.find({
        school: schoolId,
        class: classId,
        date: { $gte: targetDate, $lte: targetDateEnd },
    }).populate('recordedBy', 'name');

    const attendanceMap = new Map(
        attendanceRecords.map(a => [a.student.toString(), a])
    );

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

    return SuccessResponse(res, {
        classId,
        date: targetDate.toISOString().split('T')[0],
        summary,
        students: studentsWithAttendance,
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

    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }


    const records = await Attendance.find(query)
            .populate('recordedBy', 'name')
            .populate('session', 'subject period')
            .sort({ date: -1 })
           
    

    // Summary
    const allRecords = await Attendance.find({
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

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get all students
    const students = await Student.find({
        school: schoolId,
        classId: classId,
        status: 'active',
    }).select('name nameEn studentCode');

    // Get all attendance in period
    const attendanceRecords = await Attendance.find({
        school: schoolId,
        class: classId,
        date: { $gte: start, $lte: end },
    });

    // Build report for each student
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

    return SuccessResponse(res, {
        classId,
        period: {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
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

    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    if (status) query.status = status;

    const sessions = await TeacherSession.find(query)
            .populate('class', 'name')
            .populate('grade', 'name nameEn')
            .populate('subject', 'name nameEn')
            .populate('period', 'name startTime endTime')
            .sort({ date: -1, startedAt: -1 })

    // Summary
    const summaryQuery: any = {
        school: schoolId,
        teacher: teacherId,
    };
    if (startDate || endDate) {
        summaryQuery.date = query.date;
    }

    const allSessions = await TeacherSession.find(summaryQuery);

    const summary = {
        total: allSessions.length,
        completed: allSessions.filter(s => s.status === 'completed').length,
        inprogress: allSessions.filter(s => s.status === 'inprogress').length,
        pending: allSessions.filter(s => s.status === 'pending').length,
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

    // Get attendance
    const attendance = await Attendance.find({
        session: sessionId,
    }).populate('student', 'name nameEn studentCode');

    // Get homework
    const homework = await Homework.find({
        session: sessionId,
    });

    // Duration
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

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const sessions = await TeacherSession.find({
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

    return SuccessResponse(res, {
        date: todayStart.toISOString().split('T')[0],
        summary,
        sessions: byStatus,
    });
};