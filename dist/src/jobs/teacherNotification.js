"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAllCrons = exports.startCleanupCron = exports.startPeriodReminderCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const Schedule_1 = __importDefault(require("../models/schema/admin/Schedule"));
const Period_1 = __importDefault(require("../models/schema/admin/Period"));
const Notification_1 = require("../utils/Notification");
// ═══════════════════════════════════════════════════════════════
// ⏰ PERIOD REMINDER CRON (Every minute)
// ═══════════════════════════════════════════════════════════════
const startPeriodReminderCron = () => {
    // Run every minute
    node_cron_1.default.schedule('* * * * *', async () => {
        try {
            await checkUpcomingPeriods();
        }
        catch (error) {
            console.error('❌ Cron Error:', error);
        }
    });
    console.log('✅ Period Reminder Cron Started');
};
exports.startPeriodReminderCron = startPeriodReminderCron;
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
    const periods = await Period_1.default.find({
        startTime: targetTimeStr,
        status: 'active',
    });
    if (periods.length === 0)
        return;
    const periodIds = periods.map(p => p._id);
    // Find schedules for these periods today
    const schedules = await Schedule_1.default.find({
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
        const teacher = schedule.teacher;
        const className = schedule.class?.name;
        const subjectName = schedule.subject?.name;
        const periodName = schedule.period?.name;
        const startTime = schedule.period?.startTime;
        if (!teacher?.fcmToken)
            continue;
        await (0, Notification_1.sendNotification)(teacher.fcmToken, {
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
const startCleanupCron = () => {
    // Run daily at 00:00
    node_cron_1.default.schedule('0 0 * * *', async () => {
        try {
            await cleanupOldSessions();
        }
        catch (error) {
            console.error('❌ Cleanup Cron Error:', error);
        }
    });
    console.log('✅ Cleanup Cron Started');
};
exports.startCleanupCron = startCleanupCron;
const cleanupOldSessions = async () => {
    const TeacherSession = (await Promise.resolve().then(() => __importStar(require('../models/schema/user/teachersession')))).default;
    // Find active sessions from previous days and mark as cancelled
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);
    const result = await TeacherSession.updateMany({
        status: 'active',
        date: { $lt: yesterday },
    }, {
        $set: {
            status: 'cancelled',
            endedAt: new Date(),
            notes: 'تم إلغاؤها تلقائياً - لم يتم إنهاؤها',
        },
    });
    if (result.modifiedCount > 0) {
        console.log(`🧹 Cleaned up ${result.modifiedCount} old sessions`);
    }
};
// ═══════════════════════════════════════════════════════════════
// 🚀 START ALL CRONS
// ═══════════════════════════════════════════════════════════════
const startAllCrons = () => {
    (0, exports.startPeriodReminderCron)();
    (0, exports.startCleanupCron)();
    console.log('✅ All Cron Jobs Started');
};
exports.startAllCrons = startAllCrons;
