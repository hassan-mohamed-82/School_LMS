import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// ═══════════════════════════════════════════════════════════════
// 📅 DATE HELPER - Egypt Timezone
// ═══════════════════════════════════════════════════════════════

const DEFAULT_TIMEZONE = 'Africa/Cairo';

export const DAY_NAMES = [
    'الأحد',
    'الإثنين', 
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
];

// ═══════════════════════════════════════════════════════════════
// 📌 INTERFACES - موحدة
// ═══════════════════════════════════════════════════════════════

export interface IDateRange {
    now: Date;
    date: Date;
    dateString: string;
    dayOfWeek: number;
    dayName: string;
    currentTime: string;
    dayStart: Date;
    dayEnd: Date;
}

export interface IWeekRange {
    weekStart: Date;
    weekEnd: Date;
    weekStartString: string;
    weekEndString: string;
}

// ═══════════════════════════════════════════════════════════════
// 🕐 GET LOCAL NOW
// ═══════════════════════════════════════════════════════════════

export const getLocalNow = (timezone: string = DEFAULT_TIMEZONE): Date => {
    return toZonedTime(new Date(), timezone);
};

// ═══════════════════════════════════════════════════════════════
// 📅 GET TODAY RANGE - نطاق اليوم الحالي
// ═══════════════════════════════════════════════════════════════

export const getTodayRange = (timezone: string = DEFAULT_TIMEZONE): IDateRange => {
    const now = getLocalNow(timezone);
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);

    return {
        now,
        date: dayStart,
        dateString: format(dayStart, 'yyyy-MM-dd'),
        dayOfWeek: now.getDay(),
        dayName: DAY_NAMES[now.getDay()],
        currentTime: format(now, 'HH:mm'),
        dayStart: fromZonedTime(dayStart, timezone),
        dayEnd: fromZonedTime(dayEnd, timezone),
    };
};

// ═══════════════════════════════════════════════════════════════
// 📅 GET DATE RANGE - نطاق يوم محدد
// ═══════════════════════════════════════════════════════════════

export const getDateRange = (
    inputDate: Date | string,
    timezone: string = DEFAULT_TIMEZONE
): IDateRange => {
    const date = typeof inputDate === 'string' ? new Date(inputDate) : inputDate;
    const zonedDate = toZonedTime(date, timezone);
    const dayStart = startOfDay(zonedDate);
    const dayEnd = endOfDay(zonedDate);
    const now = getLocalNow(timezone);

    return {
        now,
        date: dayStart,
        dateString: format(dayStart, 'yyyy-MM-dd'),
        dayOfWeek: zonedDate.getDay(),
        dayName: DAY_NAMES[zonedDate.getDay()],
        currentTime: format(now, 'HH:mm'),
        dayStart: fromZonedTime(dayStart, timezone),
        dayEnd: fromZonedTime(dayEnd, timezone),
    };
};

// ═══════════════════════════════════════════════════════════════
// 📅 GET WEEK RANGE - نطاق الأسبوع
// ═══════════════════════════════════════════════════════════════

export const getWeekRange = (timezone: string = DEFAULT_TIMEZONE): IWeekRange => {
    const now = getLocalNow(timezone);
    const weekStart = startOfWeek(now, { weekStartsOn: 6 }); // السبت
    const weekEnd = endOfWeek(now, { weekStartsOn: 6 });

    return {
        weekStart: fromZonedTime(weekStart, timezone),
        weekEnd: fromZonedTime(weekEnd, timezone),
        weekStartString: format(weekStart, 'yyyy-MM-dd'),
        weekEndString: format(weekEnd, 'yyyy-MM-dd'),
    };
};

// ═══════════════════════════════════════════════════════════════
// ⏰ TIME UTILITIES
// ═══════════════════════════════════════════════════════════════

export const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const getCurrentMinutes = (timezone: string = DEFAULT_TIMEZONE): number => {
    const now = getLocalNow(timezone);
    return now.getHours() * 60 + now.getMinutes();
};

// ═══════════════════════════════════════════════════════════════
// 📝 FORMAT UTILITIES
// ═══════════════════════════════════════════════════════════════

export const formatDate = (
    date: Date | string,
    formatStr: string = 'yyyy-MM-dd',
    timezone: string = DEFAULT_TIMEZONE
): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const zonedDate = toZonedTime(d, timezone);
    return format(zonedDate, formatStr);
};

export const formatDateArabic = (
    date: Date | string,
    timezone: string = DEFAULT_TIMEZONE
): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const zonedDate = toZonedTime(d, timezone);
    const dayName = DAY_NAMES[zonedDate.getDay()];
    return `${dayName} ${format(zonedDate, 'yyyy/MM/dd')}`;
};

// ═══════════════════════════════════════════════════════════════
// 🔄 CONVERSION UTILITIES
// ═══════════════════════════════════════════════════════════════

export const toUTC = (
    date: Date | string,
    timezone: string = DEFAULT_TIMEZONE
): Date => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return fromZonedTime(d, timezone);
};

export const getDayName = (dayOfWeek: number): string => {
    return DAY_NAMES[dayOfWeek] || '';
};