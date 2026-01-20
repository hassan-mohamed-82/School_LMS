"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodaySchedule = exports.getMySchedule = void 0;
const Schedule_1 = __importDefault(require("../../../models/schema/admin/Schedule"));
const teachersession_1 = __importDefault(require("../../../models/schema/user/teachersession"));
const response_1 = require("../../../utils/response");
const date_Egypt_1 = require("../../../utils/date_Egypt");
// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Get Teacher's Active Session (inprogress)
// ═══════════════════════════════════════════════════════════════
const getActiveSession = async (teacherId, schoolId) => {
    return await teachersession_1.default.findOne({
        teacher: teacherId,
        school: schoolId,
        status: 'inprogress',
    });
};
// ═══════════════════════════════════════════════════════════════
// 📅 GET MY WEEKLY SCHEDULE (ثابت طول الترم)
// ═══════════════════════════════════════════════════════════════
const getMySchedule = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    const schedules = await Schedule_1.default.find({
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
            .sort((a, b) => (a.period?.sortOrder || 0) - (b.period?.sortOrder || 0));
        if (daySchedules.length > 0) {
            weeklySchedule.push({
                day: i,
                dayName: dayNames[i],
                periodsCount: daySchedules.length,
                periods: daySchedules,
            });
        }
    }
    return (0, response_1.SuccessResponse)(res, {
        schedule: weeklySchedule,
        totalPeriods: schedules.length,
    });
};
exports.getMySchedule = getMySchedule;
// ═══════════════════════════════════════════════════════════════
// 📅 GET TODAY'S SCHEDULE (مع حالة كل حصة)
// ═══════════════════════════════════════════════════════════════
const getTodaySchedule = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teacherId = req.user?.id;
    // استخدام النوع الموحد
    const { dayOfWeek, dayName, dateString, currentTime, dayStart, dayEnd } = (0, date_Egypt_1.getTodayRange)();
    // Get schedules
    const schedules = await Schedule_1.default.find({
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
    const sessions = await teachersession_1.default.find({
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
        const period = schedule.period;
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
                        ? Math.round(((session.endedAt?.getTime() || Date.now()) -
                            session.startedAt.getTime()) /
                            60000)
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
    return (0, response_1.SuccessResponse)(res, {
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
exports.getTodaySchedule = getTodaySchedule;
