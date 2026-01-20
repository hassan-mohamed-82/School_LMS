"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDayName = exports.toUTC = exports.formatDateArabic = exports.formatDate = exports.getCurrentMinutes = exports.minutesToTime = exports.timeToMinutes = exports.getWeekRange = exports.getDateRange = exports.getTodayRange = exports.getLocalNow = exports.DAY_NAMES = void 0;
const date_fns_1 = require("date-fns");
const date_fns_tz_1 = require("date-fns-tz");
// ═══════════════════════════════════════════════════════════════
// 📅 DATE HELPER - Egypt Timezone
// ═══════════════════════════════════════════════════════════════
const DEFAULT_TIMEZONE = 'Africa/Cairo';
exports.DAY_NAMES = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
];
// ═══════════════════════════════════════════════════════════════
// 🕐 GET LOCAL NOW
// ═══════════════════════════════════════════════════════════════
const getLocalNow = (timezone = DEFAULT_TIMEZONE) => {
    return (0, date_fns_tz_1.toZonedTime)(new Date(), timezone);
};
exports.getLocalNow = getLocalNow;
// ═══════════════════════════════════════════════════════════════
// 📅 GET TODAY RANGE - نطاق اليوم الحالي
// ═══════════════════════════════════════════════════════════════
const getTodayRange = (timezone = DEFAULT_TIMEZONE) => {
    const now = (0, exports.getLocalNow)(timezone);
    const dayStart = (0, date_fns_1.startOfDay)(now);
    const dayEnd = (0, date_fns_1.endOfDay)(now);
    return {
        now,
        date: dayStart,
        dateString: (0, date_fns_1.format)(dayStart, 'yyyy-MM-dd'),
        dayOfWeek: now.getDay(),
        dayName: exports.DAY_NAMES[now.getDay()],
        currentTime: (0, date_fns_1.format)(now, 'HH:mm'),
        dayStart: (0, date_fns_tz_1.fromZonedTime)(dayStart, timezone),
        dayEnd: (0, date_fns_tz_1.fromZonedTime)(dayEnd, timezone),
    };
};
exports.getTodayRange = getTodayRange;
// ═══════════════════════════════════════════════════════════════
// 📅 GET DATE RANGE - نطاق يوم محدد
// ═══════════════════════════════════════════════════════════════
const getDateRange = (inputDate, timezone = DEFAULT_TIMEZONE) => {
    const date = typeof inputDate === 'string' ? new Date(inputDate) : inputDate;
    const zonedDate = (0, date_fns_tz_1.toZonedTime)(date, timezone);
    const dayStart = (0, date_fns_1.startOfDay)(zonedDate);
    const dayEnd = (0, date_fns_1.endOfDay)(zonedDate);
    const now = (0, exports.getLocalNow)(timezone);
    return {
        now,
        date: dayStart,
        dateString: (0, date_fns_1.format)(dayStart, 'yyyy-MM-dd'),
        dayOfWeek: zonedDate.getDay(),
        dayName: exports.DAY_NAMES[zonedDate.getDay()],
        currentTime: (0, date_fns_1.format)(now, 'HH:mm'),
        dayStart: (0, date_fns_tz_1.fromZonedTime)(dayStart, timezone),
        dayEnd: (0, date_fns_tz_1.fromZonedTime)(dayEnd, timezone),
    };
};
exports.getDateRange = getDateRange;
// ═══════════════════════════════════════════════════════════════
// 📅 GET WEEK RANGE - نطاق الأسبوع
// ═══════════════════════════════════════════════════════════════
const getWeekRange = (timezone = DEFAULT_TIMEZONE) => {
    const now = (0, exports.getLocalNow)(timezone);
    const weekStart = (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 6 }); // السبت
    const weekEnd = (0, date_fns_1.endOfWeek)(now, { weekStartsOn: 6 });
    return {
        weekStart: (0, date_fns_tz_1.fromZonedTime)(weekStart, timezone),
        weekEnd: (0, date_fns_tz_1.fromZonedTime)(weekEnd, timezone),
        weekStartString: (0, date_fns_1.format)(weekStart, 'yyyy-MM-dd'),
        weekEndString: (0, date_fns_1.format)(weekEnd, 'yyyy-MM-dd'),
    };
};
exports.getWeekRange = getWeekRange;
// ═══════════════════════════════════════════════════════════════
// ⏰ TIME UTILITIES
// ═══════════════════════════════════════════════════════════════
const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};
exports.timeToMinutes = timeToMinutes;
const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};
exports.minutesToTime = minutesToTime;
const getCurrentMinutes = (timezone = DEFAULT_TIMEZONE) => {
    const now = (0, exports.getLocalNow)(timezone);
    return now.getHours() * 60 + now.getMinutes();
};
exports.getCurrentMinutes = getCurrentMinutes;
// ═══════════════════════════════════════════════════════════════
// 📝 FORMAT UTILITIES
// ═══════════════════════════════════════════════════════════════
const formatDate = (date, formatStr = 'yyyy-MM-dd', timezone = DEFAULT_TIMEZONE) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const zonedDate = (0, date_fns_tz_1.toZonedTime)(d, timezone);
    return (0, date_fns_1.format)(zonedDate, formatStr);
};
exports.formatDate = formatDate;
const formatDateArabic = (date, timezone = DEFAULT_TIMEZONE) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const zonedDate = (0, date_fns_tz_1.toZonedTime)(d, timezone);
    const dayName = exports.DAY_NAMES[zonedDate.getDay()];
    return `${dayName} ${(0, date_fns_1.format)(zonedDate, 'yyyy/MM/dd')}`;
};
exports.formatDateArabic = formatDateArabic;
// ═══════════════════════════════════════════════════════════════
// 🔄 CONVERSION UTILITIES
// ═══════════════════════════════════════════════════════════════
const toUTC = (date, timezone = DEFAULT_TIMEZONE) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return (0, date_fns_tz_1.fromZonedTime)(d, timezone);
};
exports.toUTC = toUTC;
const getDayName = (dayOfWeek) => {
    return exports.DAY_NAMES[dayOfWeek] || '';
};
exports.getDayName = getDayName;
