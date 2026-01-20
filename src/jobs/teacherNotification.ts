import cron from 'node-cron';
import Schedule from '../models/schema/admin/Schedule';
import Period from '../models/schema/admin/Period';
import { sendNotification } from '../utils/Notification';
import { getTodayRange, getLocalNow, timeToMinutes, minutesToTime } from '../utils/date_Egypt';

// ═══════════════════════════════════════════════════════════════
// ⏰ PERIOD REMINDER CRON (Every minute)
// ═══════════════════════════════════════════════════════════════

export const startPeriodReminderCron = () => {
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
    // ✅ استخدم الـ Helper
    const { dayOfWeek, currentTime } = getTodayRange();
    const localNow = getLocalNow();

    // Current time + 15 minutes
    const currentMinutes = timeToMinutes(currentTime);
    const targetMinutes = currentMinutes + 15;
    const targetTimeStr = minutesToTime(targetMinutes);

    console.log(`⏰ Checking periods at ${targetTimeStr} (current: ${currentTime})`);

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
// 🧹 CLEANUP OLD SESSIONS CRON (Daily at midnight Egypt time)
// ═══════════════════════════════════════════════════════════════

export const startCleanupCron = () => {
    // Run daily at 00:00 Egypt time (22:00 UTC)
    cron.schedule('0 22 * * *', async () => {
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

    // ✅ استخدم الـ Helper
    const { dayStart } = getTodayRange();

    // Find inprogress sessions from previous days
    const result = await TeacherSession.updateMany(
        {
            status: 'inprogress',
            date: { $lt: dayStart },
        },
        {
            $set: {
                status: 'completed',
                endedAt: new Date(),
                notes: 'تم إنهاؤها تلقائياً - لم يتم إنهاؤها يدوياً',
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
