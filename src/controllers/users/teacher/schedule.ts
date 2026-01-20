import { Request, Response } from 'express';
import { BadRequest } from '../../../Errors/BadRequest';
import { NotFound } from '../../../Errors/NotFound';
import Schedule from '../../../models/schema/admin/Schedule';
import TeacherSession from '../../../models/schema/user/teachersession';
import Student from '../../../models/schema/admin/Student';
import Attendance from '../../../models/schema/admin/Attendance';
import Homework from '../../../models/schema/user/homework';
import { SuccessResponse } from '../../../utils/response';
import { saveBase64Image } from '../../../utils/handleImages';
import { getTodayRange, IDateRange } from '../../../utils/date_Egypt';

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Get Teacher's Active Session (inprogress)
// ═══════════════════════════════════════════════════════════════

const getActiveSession = async (teacherId: string, schoolId: string) => {
    return await TeacherSession.findOne({
        teacher: teacherId,
        school: schoolId,
        status: 'inprogress',
    });
};

// ═══════════════════════════════════════════════════════════════
// 📅 GET MY WEEKLY SCHEDULE (ثابت طول الترم)
// ═══════════════════════════════════════════════════════════════

export const getMySchedule = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;

    const schedules = await Schedule.find({
        school: schoolId,
        teacher: teacherId,
        status: 'active',
    })
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime sortOrder')
        .sort({ dayOfWeek: 1 });

    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    const weeklySchedule = [];
    for (let i = 0; i <= 6; i++) {
        const daySchedules = schedules
            .filter(s => s.dayOfWeek === i)
            .sort((a: any, b: any) => (a.period?.sortOrder || 0) - (b.period?.sortOrder || 0));

        if (daySchedules.length > 0) {
            weeklySchedule.push({
                day: i,
                dayName: dayNames[i],
                periodsCount: daySchedules.length,
                periods: daySchedules,
            });
        }
    }

    return SuccessResponse(res, {
        schedule: weeklySchedule,
        totalPeriods: schedules.length,
    });
};

// ═══════════════════════════════════════════════════════════════
// 📅 GET TODAY'S SCHEDULE (مع حالة كل حصة)
// ═══════════════════════════════════════════════════════════════

export const getTodaySchedule = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;

    // استخدام النوع الموحد
    const { dayOfWeek, dayName, dateString, currentTime, dayStart, dayEnd }: IDateRange = getTodayRange();

    // Get schedules
    const schedules = await Schedule.find({
        school: schoolId,
        teacher: teacherId,
        dayOfWeek,
        status: 'active',
    })
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime sortOrder')
        .sort({ 'period.sortOrder': 1 });

    // Get sessions
    const sessions = await TeacherSession.find({
        school: schoolId,
        teacher: teacherId,
        date: { $gte: dayStart, $lte: dayEnd },
    });

    // Create map
    const sessionMap = new Map();
    sessions.forEach((session) => {
        sessionMap.set(session.schedule.toString(), session);
    });

    // Build periods
    const periods = schedules.map((schedule) => {
        const session = sessionMap.get(schedule._id.toString());
        const period = schedule.period as any;

        const sessionStatus = session?.status || 'pending';
        const canStart = sessionStatus === 'pending';
        const canEnd = sessionStatus === 'inprogress';

        return {
            scheduleId: schedule._id,
            grade: schedule.grade,
            class: schedule.class,
            subject: schedule.subject,
            period: {
                _id: period._id,
                name: period.name,
                startTime: period.startTime,
                endTime: period.endTime,
            },
            sessionStatus,
            canStart,
            canEnd,
            sessionId: session?._id || null,
            sessionData: session
                ? {
                      startedAt: session.startedAt,
                      endedAt: session.endedAt,
                      duration: session.startedAt
                          ? Math.round(
                                ((session.endedAt?.getTime() || Date.now()) -
                                    session.startedAt.getTime()) /
                                    60000
                            )
                          : null,
                      attendanceCount: session.attendanceCount,
                  }
                : null,
        };
    });

    // Active session
    const activeSession = sessions.find((s) => s.status === 'inprogress');

    // Summary
    const summary = {
        total: periods.length,
        pending: periods.filter((p) => p.sessionStatus === 'pending').length,
        inprogress: periods.filter((p) => p.sessionStatus === 'inprogress').length,
        completed: periods.filter((p) => p.sessionStatus === 'completed').length,
    };

    return SuccessResponse(res, {
        dayOfWeek,
        dayName,
        date: dateString,
        currentTime,
        summary,
        periods,
        hasActiveSession: !!activeSession,
        activeSessionId: activeSession?._id || null,
    });
};