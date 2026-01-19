import cron from 'node-cron';
import Schedule from '../models/schema/admin/Schedule';
import Period from '../models/schema/admin/Period';
import Teacher from '../models/schema/admin/Teacher';
import { sendNotification } from '../utils/Notification';

// ═══════════════════════════════════════════════════════════════
// ⏰ PERIOD REMINDER CRON (Every minute)
// ═══════════════════════════════════════════════════════════════

export const startPeriodReminderCron = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            await checkUpcomingPeriods();
        } catch (error) {
            console.error('❌ Cron Error:', error);
        }
    });

    console.log('✅ Period Reminder Cron Started');
};

// ═══════════════════════════════════════════════════════════════
// 🔍 CHECK UPCOMING PERIODS
// ═══════════════════════════════════════════════════════════════

const checkUpcomingPeriods = async () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // Current time + 15 minutes
    const targetTime = new Date(now.getTime() + 15 * 60 * 1000);
    const targetHour = targetTime.getHours();
    const targetMinute = targetTime.getMinutes();
    const targetTimeStr = `${targetHour.toString().padStart(2, '0')}:${targetMinute.toString().padStart(2, '0')}`;

    // Find periods starting at target time
    const periods = await Period.find({
        startTime: targetTimeStr,
        status: 'active',
    });

    if (periods.length === 0) return;

    const periodIds = periods.map(p => p._id);

    // Find schedules for these periods today
    const schedules = await Schedule.find({
        period: { $in: periodIds },
        dayOfWeek: dayOfWeek,
        status: 'active',
    })
        .populate('teacher', 'name fcmToken')
        .populate('class', 'name')
        .populate('subject', 'name')
        .populate('period', 'name startTime');

    // Send notifications
    for (const schedule of schedules) {
        const teacher = schedule.teacher as any;
        const className = (schedule.class as any)?.name;
        const subjectName = (schedule.subject as any)?.name;
        const periodName = (schedule.period as any)?.name;
        const startTime = (schedule.period as any)?.startTime;

        if (!teacher?.fcmToken) continue;

        await sendNotification(teacher.fcmToken, {
            title: '⏰ تذكير بالحصة',
            body: `حصتك "${subjectName}" مع فصل "${className}" ستبدأ الساعة ${startTime}`,
            data: {
                type: 'period_reminder',
                scheduleId: schedule._id.toString(),
                periodName: periodName || '',
                startTime: startTime || '',
            },
        });

        console.log(`📤 Reminder sent to ${teacher.name} for ${subjectName} at ${startTime}`);
    }
};

// ═══════════════════════════════════════════════════════════════
// 🧹 CLEANUP OLD SESSIONS CRON (Daily at midnight)
// ═══════════════════════════════════════════════════════════════

export const startCleanupCron = () => {
    // Run daily at 00:00
    cron.schedule('0 0 * * *', async () => {
        try {
            await cleanupOldSessions();
        } catch (error) {
            console.error('❌ Cleanup Cron Error:', error);
        }
    });

    console.log('✅ Cleanup Cron Started');
};

const cleanupOldSessions = async () => {
    const TeacherSession = (await import('../models/schema/user/teachersession')).default;
    
    // Find active sessions from previous days and mark as cancelled
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const result = await TeacherSession.updateMany(
        {
            status: 'active',
            date: { $lt: yesterday },
        },
        {
            $set: {
                status: 'cancelled',
                endedAt: new Date(),
                notes: 'تم إلغاؤها تلقائياً - لم يتم إنهاؤها',
            },
        }
    );

    if (result.modifiedCount > 0) {
        console.log(`🧹 Cleaned up ${result.modifiedCount} old sessions`);
    }
};

// ═══════════════════════════════════════════════════════════════
// 🚀 START ALL CRONS
// ═══════════════════════════════════════════════════════════════

export const startAllCrons = () => {
    startPeriodReminderCron();
    startCleanupCron();
    console.log('✅ All Cron Jobs Started');
};
