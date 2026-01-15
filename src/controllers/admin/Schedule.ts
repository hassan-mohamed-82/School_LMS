import { Request, Response } from 'express';
import Schedule from '../../models/schema/admin/Schedule';
import Grade from '../../models/schema/admin/Grade';
import Class from '../../models/schema/admin/Class';
import Subject from '../../models/schema/admin/Subject';
import Teacher from '../../models/schema/admin/Teacher';
import Period from '../../models/schema/admin/Period';
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL SCHEDULES
// ═══════════════════════════════════════════════════════════════

export const getAllSchedules = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, classId, teacherId, dayOfWeek, academicYear, status } = req.query;

    // Build query
    const query: any = { school: schoolId };
    if (gradeId) query.grade = gradeId;
    if (classId) query.class = classId;
    if (teacherId) query.teacher = teacherId;
    if (dayOfWeek !== undefined) query.dayOfWeek = Number(dayOfWeek);
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;

    const schedules = await Schedule.find(query)
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn')
        .populate('teacher', 'name phone')
        .populate('period', 'name startTime endTime')
        .sort({ dayOfWeek: 1, 'period.sortOrder': 1 });

    return SuccessResponse(res, { schedules });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE SCHEDULE
// ═══════════════════════════════════════════════════════════════

export const getOneSchedule = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const schedule = await Schedule.findOne({ _id: id, school: schoolId })
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn')
        .populate('teacher', 'name phone')
        .populate('period', 'name startTime endTime');

    if (!schedule) {
        throw new NotFound('الجدول غير موجود');
    }

    return SuccessResponse(res, { schedule });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE SCHEDULE
// ═══════════════════════════════════════════════════════════════

export const createSchedule = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, classId, subjectId, teacherId, periodId, dayOfWeek, academicYear, status } = req.body;

    // Check if this slot is already taken (same class, period, day, year)
    const existingSchedule = await Schedule.findOne({
        school: schoolId,
        class: classId,
        period: periodId,
        dayOfWeek: dayOfWeek,
        academicYear: academicYear,
    });

    if (existingSchedule) {
        throw new BadRequest('هذه الحصة محجوزة مسبقاً لهذا الفصل');
    }

    // Check if teacher is busy at this time
    const teacherBusy = await Schedule.findOne({
        school: schoolId,
        teacher: teacherId,
        period: periodId,
        dayOfWeek: dayOfWeek,
        academicYear: academicYear,
    });

    if (teacherBusy) {
        throw new BadRequest('المدرس مشغول في هذه الحصة');
    }

    const schedule = await Schedule.create({
        school: schoolId,
        grade: gradeId,
        class: classId,
        subject: subjectId,
        teacher: teacherId,
        period: periodId,
        dayOfWeek,
        academicYear,
        status: status || 'active',
    });

    // Populate for response
    await schedule.populate('grade', 'name nameEn');
    await schedule.populate('class', 'name');
    await schedule.populate('subject', 'name nameEn');
    await schedule.populate('teacher', 'name phone');
    await schedule.populate('period', 'name startTime endTime');

    return SuccessResponse(res, { schedule, message: 'تم إضافة الجدول بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE SCHEDULE
// ═══════════════════════════════════════════════════════════════

export const updateSchedule = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { gradeId, classId, subjectId, teacherId, periodId, dayOfWeek, academicYear, status } = req.body;

    // Check if schedule exists
    const existingSchedule = await Schedule.findOne({ _id: id, school: schoolId });
    if (!existingSchedule) {
        throw new NotFound('الجدول غير موجود');
    }

    // Check for conflicts if changing slot
    const checkClass = classId || existingSchedule.class;
    const checkPeriod = periodId || existingSchedule.period;
    const checkDay = dayOfWeek !== undefined ? dayOfWeek : existingSchedule.dayOfWeek;
    const checkYear = academicYear || existingSchedule.academicYear;
    const checkTeacher = teacherId || existingSchedule.teacher;

    // Check if slot is taken
    if (classId || periodId || dayOfWeek !== undefined || academicYear) {
        const slotTaken = await Schedule.findOne({
            school: schoolId,
            class: checkClass,
            period: checkPeriod,
            dayOfWeek: checkDay,
            academicYear: checkYear,
            _id: { $ne: id },
        });

        if (slotTaken) {
            throw new BadRequest('هذه الحصة محجوزة مسبقاً لهذا الفصل');
        }
    }

    // Check if teacher is busy
    if (teacherId || periodId || dayOfWeek !== undefined || academicYear) {
        const teacherBusy = await Schedule.findOne({
            school: schoolId,
            teacher: checkTeacher,
            period: checkPeriod,
            dayOfWeek: checkDay,
            academicYear: checkYear,
            _id: { $ne: id },
        });

        if (teacherBusy) {
            throw new BadRequest('المدرس مشغول في هذه الحصة');
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (gradeId !== undefined) updateData.grade = gradeId;
    if (classId !== undefined) updateData.class = classId;
    if (subjectId !== undefined) updateData.subject = subjectId;
    if (teacherId !== undefined) updateData.teacher = teacherId;
    if (periodId !== undefined) updateData.period = periodId;
    if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (status !== undefined) updateData.status = status;

    const schedule = await Schedule.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    )
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn')
        .populate('teacher', 'name phone')
        .populate('period', 'name startTime endTime');

    return SuccessResponse(res, { schedule, message: 'تم تحديث الجدول بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE SCHEDULE
// ═══════════════════════════════════════════════════════════════

export const removeSchedule = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const schedule = await Schedule.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!schedule) {
        throw new NotFound('الجدول غير موجود');
    }

    return SuccessResponse(res, { schedule, message: 'تم حذف الجدول بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 📋 SELECT - Get all IDs for dropdown
// ═══════════════════════════════════════════════════════════════

export const select = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;

    const [grades, classes, subjects, teachers, periods] = await Promise.all([
        Grade.find({ school: schoolId, status: 'active' }).select('name nameEn'),
        Class.find({ school: schoolId, status: 'active' }).select('name gradeId').populate('gradeId', 'name'),
        Subject.find({ school: schoolId, status: 'active' }).select('name nameEn'),
        Teacher.find({ school: schoolId, status: 'active' }).select('name phone'),
        Period.find({ school: schoolId, status: 'active' }).select('name startTime endTime sortOrder').sort({ sortOrder: 1 }),
    ]);

    return SuccessResponse(res, { grades, classes, subjects, teachers, periods });
};

// ═══════════════════════════════════════════════════════════════
// 📅 GET SCHEDULE BY CLASS (Weekly View)
// ═══════════════════════════════════════════════════════════════

export const getByClass = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { classId, academicYear } = req.body;

    if (!classId) {
        throw new BadRequest('الفصل مطلوب');
    }

    const query: any = { school: schoolId, class: classId };
    if (academicYear) query.academicYear = academicYear;

    const schedules = await Schedule.find(query)
        .populate('subject', 'name nameEn')
        .populate('teacher', 'name')
        .populate('period', 'name startTime endTime sortOrder')
        .sort({ dayOfWeek: 1 });

    // Group by day
    const weeklySchedule: any = {};
    for (let i = 0; i <= 6; i++) {
        weeklySchedule[i] = schedules.filter(s => s.dayOfWeek === i);
    }

    return SuccessResponse(res, { schedules: weeklySchedule });
};
