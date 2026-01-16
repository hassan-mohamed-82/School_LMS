"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.select = exports.removeExam = exports.updateExam = exports.createExam = exports.getOneExam = exports.getAllExams = void 0;
const Exam_1 = __importDefault(require("../../models/schema/admin/Exam"));
const Grade_1 = __importDefault(require("../../models/schema/admin/Grade"));
const Subject_1 = __importDefault(require("../../models/schema/admin/Subject"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL EXAMS
// ═══════════════════════════════════════════════════════════════
const getAllExams = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, subjectId, type, academicYear, status } = req.query;
    // Build query
    const query = { school: schoolId };
    if (gradeId)
        query.gradeId = gradeId;
    if (subjectId)
        query.subject = subjectId;
    if (type)
        query.type = type;
    if (academicYear)
        query.academicYear = academicYear;
    if (status)
        query.status = status;
    const exams = await Exam_1.default.find(query)
        .populate('gradeId', 'name nameEn')
        .populate('subject', 'name nameEn')
        .sort({ date: -1, createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { exams });
};
exports.getAllExams = getAllExams;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE EXAM
// ═══════════════════════════════════════════════════════════════
const getOneExam = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const exam = await Exam_1.default.findOne({ _id: id, school: schoolId })
        .populate('gradeId', 'name nameEn')
        .populate('subject', 'name nameEn');
    if (!exam) {
        throw new Errors_1.NotFound('الامتحان غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { exam });
};
exports.getOneExam = getOneExam;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE EXAM
// ═══════════════════════════════════════════════════════════════
const createExam = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, subjectId, name, type, totalMarks, passingMarks, date, academicYear, status } = req.body;
    // Check if exam already exists
    const existingExam = await Exam_1.default.findOne({
        school: schoolId,
        gradeId: gradeId,
        subject: subjectId,
        type: type,
        academicYear: academicYear,
        name: name,
    });
    if (existingExam) {
        throw new BadRequest_1.BadRequest('هذا الامتحان موجود مسبقاً');
    }
    const exam = await Exam_1.default.create({
        school: schoolId,
        gradeId,
        subject: subjectId,
        name,
        type,
        totalMarks,
        passingMarks,
        date,
        academicYear,
        status: status || 'active',
    });
    // Populate for response
    await exam.populate('gradeId', 'name nameEn');
    await exam.populate('subject', 'name nameEn');
    return (0, response_1.SuccessResponse)(res, { exam, message: 'تم إضافة الامتحان بنجاح' }, 201);
};
exports.createExam = createExam;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE EXAM
// ═══════════════════════════════════════════════════════════════
const updateExam = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { gradeId, subjectId, name, type, totalMarks, passingMarks, date, academicYear, status } = req.body;
    // Check if exam exists
    const existingExam = await Exam_1.default.findOne({ _id: id, school: schoolId });
    if (!existingExam) {
        throw new Errors_1.NotFound('الامتحان غير موجود');
    }
    // Prepare update data
    const updateData = {};
    if (gradeId !== undefined)
        updateData.gradeId = gradeId;
    if (subjectId !== undefined)
        updateData.subject = subjectId;
    if (name !== undefined)
        updateData.name = name;
    if (type !== undefined)
        updateData.type = type;
    if (totalMarks !== undefined)
        updateData.totalMarks = totalMarks;
    if (passingMarks !== undefined)
        updateData.passingMarks = passingMarks;
    if (date !== undefined)
        updateData.date = date;
    if (academicYear !== undefined)
        updateData.academicYear = academicYear;
    if (status !== undefined)
        updateData.status = status;
    const exam = await Exam_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .populate('gradeId', 'name nameEn')
        .populate('subject', 'name nameEn');
    return (0, response_1.SuccessResponse)(res, { exam, message: 'تم تحديث الامتحان بنجاح' });
};
exports.updateExam = updateExam;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE EXAM
// ═══════════════════════════════════════════════════════════════
const removeExam = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const exam = await Exam_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!exam) {
        throw new Errors_1.NotFound('الامتحان غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { exam, message: 'تم حذف الامتحان بنجاح' });
};
exports.removeExam = removeExam;
// ═══════════════════════════════════════════════════════════════
// 📋 SELECT - Get all IDs for dropdown
// ═══════════════════════════════════════════════════════════════
const select = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const [grades, subjects] = await Promise.all([
        Grade_1.default.find({ school: schoolId, status: 'active' }).select('name nameEn'),
        Subject_1.default.find({ school: schoolId, status: 'active' }).select('name nameEn'),
    ]);
    // Exam types list
    const examTypes = [
        { value: 'monthly', label: 'شهري' },
        { value: 'midterm', label: 'نصف الترم' },
        { value: 'semester', label: 'الترم' },
        { value: 'final', label: 'نهائي' },
    ];
    return (0, response_1.SuccessResponse)(res, { grades, subjects, examTypes });
};
exports.select = select;
