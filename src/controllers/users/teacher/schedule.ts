import { Request, Response } from 'express';
import Schedule from '../../../models/schema/admin/Schedule';
import TeacherSession from '../../../models/schema/user/teachersession';
import Attendance from '../../../models/schema/admin/Attendance';
import Student from '../../../models/schema/admin/Student';
import Homework from '../../../models/schema/user/homework';
import { NotFound} from '../../../Errors';
import { SuccessResponse } from '../../../utils/response';
import { saveBase64Image } from '../../../utils/handleImages';

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

    // Group by day
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
// 📅 GET TODAY'S SCHEDULE
// ═══════════════════════════════════════════════════════════════

export const getTodaySchedule = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // Get today's schedules
    const schedules = await Schedule.find({
        school: schoolId,
        teacher: teacherId,
        dayOfWeek: dayOfWeek,
        status: 'active',
    })
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn')
        .populate('period', 'name startTime endTime sortOrder')
        .sort({ 'period.sortOrder': 1 });

    // Get today's sessions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const sessions = await TeacherSession.find({
        school: schoolId,
        teacher: teacherId,
        date: { $gte: todayStart, $lte: todayEnd },
    });

    // Add session status to each schedule
    const schedulesWithStatus = schedules
        .sort((a: any, b: any) => (a.period?.sortOrder || 0) - (b.period?.sortOrder || 0))
        .map(schedule => {
            const session = sessions.find(s => s.schedule.toString() === schedule._id.toString());
            
            let sessionStatus = 'not_started';
            if (session) {
                sessionStatus = session.status;
            }

            return {
                _id: schedule._id,
                grade: schedule.grade,
                class: schedule.class,
                subject: schedule.subject,
                period: schedule.period,
                sessionStatus,
                sessionId: session?._id || null,
                attendanceCount: session?.attendanceCount || null,
            };
        });

    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    return SuccessResponse(res, {
        day: dayOfWeek,
        dayName: dayNames[dayOfWeek],
        date: today.toISOString().split('T')[0],
        periodsCount: schedulesWithStatus.length,
        periods: schedulesWithStatus,
    });
};