"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByClass = exports.select = exports.removeSchedule = exports.updateSchedule = exports.createSchedule = exports.getOneSchedule = exports.getAllSchedules = void 0;
const Schedule_1 = __importDefault(require("../../models/schema/admin/Schedule"));
const Grade_1 = __importDefault(require("../../models/schema/admin/Grade"));
const Class_1 = __importDefault(require("../../models/schema/admin/Class"));
const Subject_1 = __importDefault(require("../../models/schema/admin/Subject"));
const Teacher_1 = __importDefault(require("../../models/schema/admin/Teacher"));
const Period_1 = __importDefault(require("../../models/schema/admin/Period"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL SCHEDULES
// ═══════════════════════════════════════════════════════════════
const getAllSchedules = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, classId, teacherId, dayOfWeek, academicYear, status } = req.query;
    // Build query
    const query = { school: schoolId };
    if (gradeId)
        query.grade = gradeId;
    if (classId)
        query.class = classId;
    if (teacherId)
        query.teacher = teacherId;
    if (dayOfWeek !== undefined)
        query.dayOfWeek = Number(dayOfWeek);
    if (academicYear)
        query.academicYear = academicYear;
    if (status)
        query.status = status;
    const schedules = await Schedule_1.default.find(query)
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn')
        .populate('teacher', 'name phone')
        .populate('period', 'name startTime endTime')
        .sort({ dayOfWeek: 1, 'period.sortOrder': 1 });
    return (0, response_1.SuccessResponse)(res, { schedules });
};
exports.getAllSchedules = getAllSchedules;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE SCHEDULE
// ═══════════════════════════════════════════════════════════════
const getOneSchedule = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const schedule = await Schedule_1.default.findOne({ _id: id, school: schoolId })
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn')
        .populate('teacher', 'name phone')
        .populate('period', 'name startTime endTime');
    if (!schedule) {
        throw new Errors_1.NotFound('الجدول غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { schedule });
};
exports.getOneSchedule = getOneSchedule;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE SCHEDULE
// ═══════════════════════════════════════════════════════════════
const createSchedule = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, classId, subjectId, teacherId, periodId, dayOfWeek, academicYear, status } = req.body;
    // Check if this slot is already taken (same class, period, day, year)
    const existingSchedule = await Schedule_1.default.findOne({
        school: schoolId,
        class: classId,
        period: periodId,
        dayOfWeek: dayOfWeek,
        academicYear: academicYear,
    });
    if (existingSchedule) {
        throw new BadRequest_1.BadRequest('هذه الحصة محجوزة مسبقاً لهذا الفصل');
    }
    // Check if teacher is busy at this time
    const teacherBusy = await Schedule_1.default.findOne({
        school: schoolId,
        teacher: teacherId,
        period: periodId,
        dayOfWeek: dayOfWeek,
        academicYear: academicYear,
    });
    if (teacherBusy) {
        throw new BadRequest_1.BadRequest('المدرس مشغول في هذه الحصة');
    }
    const schedule = await Schedule_1.default.create({
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
    return (0, response_1.SuccessResponse)(res, { schedule, message: 'تم إضافة الجدول بنجاح' }, 201);
};
exports.createSchedule = createSchedule;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE SCHEDULE
// ═══════════════════════════════════════════════════════════════
const updateSchedule = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { gradeId, classId, subjectId, teacherId, periodId, dayOfWeek, academicYear, status } = req.body;
    // Check if schedule exists
    const existingSchedule = await Schedule_1.default.findOne({ _id: id, school: schoolId });
    if (!existingSchedule) {
        throw new Errors_1.NotFound('الجدول غير موجود');
    }
    // Check for conflicts if changing slot
    const checkClass = classId || existingSchedule.class;
    const checkPeriod = periodId || existingSchedule.period;
    const checkDay = dayOfWeek !== undefined ? dayOfWeek : existingSchedule.dayOfWeek;
    const checkYear = academicYear || existingSchedule.academicYear;
    const checkTeacher = teacherId || existingSchedule.teacher;
    // Check if slot is taken
    if (classId || periodId || dayOfWeek !== undefined || academicYear) {
        const slotTaken = await Schedule_1.default.findOne({
            school: schoolId,
            class: checkClass,
            period: checkPeriod,
            dayOfWeek: checkDay,
            academicYear: checkYear,
            _id: { $ne: id },
        });
        if (slotTaken) {
            throw new BadRequest_1.BadRequest('هذه الحصة محجوزة مسبقاً لهذا الفصل');
        }
    }
    // Check if teacher is busy
    if (teacherId || periodId || dayOfWeek !== undefined || academicYear) {
        const teacherBusy = await Schedule_1.default.findOne({
            school: schoolId,
            teacher: checkTeacher,
            period: checkPeriod,
            dayOfWeek: checkDay,
            academicYear: checkYear,
            _id: { $ne: id },
        });
        if (teacherBusy) {
            throw new BadRequest_1.BadRequest('المدرس مشغول في هذه الحصة');
        }
    }
    // Prepare update data
    const updateData = {};
    if (gradeId !== undefined)
        updateData.grade = gradeId;
    if (classId !== undefined)
        updateData.class = classId;
    if (subjectId !== undefined)
        updateData.subject = subjectId;
    if (teacherId !== undefined)
        updateData.teacher = teacherId;
    if (periodId !== undefined)
        updateData.period = periodId;
    if (dayOfWeek !== undefined)
        updateData.dayOfWeek = dayOfWeek;
    if (academicYear !== undefined)
        updateData.academicYear = academicYear;
    if (status !== undefined)
        updateData.status = status;
    const schedule = await Schedule_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .populate('grade', 'name nameEn')
        .populate('class', 'name')
        .populate('subject', 'name nameEn')
        .populate('teacher', 'name phone')
        .populate('period', 'name startTime endTime');
    return (0, response_1.SuccessResponse)(res, { schedule, message: 'تم تحديث الجدول بنجاح' });
};
exports.updateSchedule = updateSchedule;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE SCHEDULE
// ═══════════════════════════════════════════════════════════════
const removeSchedule = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const schedule = await Schedule_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!schedule) {
        throw new Errors_1.NotFound('الجدول غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { schedule, message: 'تم حذف الجدول بنجاح' });
};
exports.removeSchedule = removeSchedule;
// ═══════════════════════════════════════════════════════════════
// 📋 SELECT - Get all IDs for dropdown
// ═══════════════════════════════════════════════════════════════
const select = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const [grades, classes, subjects, teachers, periods] = await Promise.all([
        Grade_1.default.find({ school: schoolId, status: 'active' }).select('name nameEn'),
        Class_1.default.find({ school: schoolId, status: 'active' }).select('name gradeId').populate('gradeId', 'name'),
        Subject_1.default.find({ school: schoolId, status: 'active' }).select('name nameEn'),
        Teacher_1.default.find({ school: schoolId, status: 'active' }).select('name phone'),
        Period_1.default.find({ school: schoolId, status: 'active' }).select('name startTime endTime sortOrder').sort({ sortOrder: 1 }),
    ]);
    return (0, response_1.SuccessResponse)(res, { grades, classes, subjects, teachers, periods });
};
exports.select = select;
// ═══════════════════════════════════════════════════════════════
// 📅 GET SCHEDULE BY CLASS (Weekly View)
// ═══════════════════════════════════════════════════════════════
const getByClass = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { classId, academicYear } = req.body;
    if (!classId) {
        throw new BadRequest_1.BadRequest('الفصل مطلوب');
    }
    const query = { school: schoolId, class: classId };
    if (academicYear)
        query.academicYear = academicYear;
    const schedules = await Schedule_1.default.find(query)
        .populate('subject', 'name nameEn')
        .populate('teacher', 'name')
        .populate('period', 'name startTime endTime sortOrder')
        .sort({ dayOfWeek: 1 });
    // Group by day
    const weeklySchedule = {};
    for (let i = 0; i <= 6; i++) {
        weeklySchedule[i] = schedules.filter(s => s.dayOfWeek === i);
    }
    return (0, response_1.SuccessResponse)(res, { schedules: weeklySchedule });
};
exports.getByClass = getByClass;
