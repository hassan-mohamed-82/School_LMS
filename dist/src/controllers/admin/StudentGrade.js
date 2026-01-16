"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByStudent = exports.select = exports.removeStudentGrade = exports.updateStudentGrade = exports.createStudentGrade = exports.getOneStudentGrade = exports.getAllStudentGrades = void 0;
const StudentGrade_1 = __importDefault(require("../../models/schema/admin/StudentGrade"));
const Student_1 = __importDefault(require("../../models/schema/admin/Student"));
const Exam_1 = __importDefault(require("../../models/schema/admin/Exam"));
const Grade_1 = __importDefault(require("../../models/schema/admin/Grade"));
const Class_1 = __importDefault(require("../../models/schema/admin/Class"));
const Subject_1 = __importDefault(require("../../models/schema/admin/Subject"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL STUDENT GRADES
// ═══════════════════════════════════════════════════════════════
const getAllStudentGrades = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { studentId, examId } = req.query;
    // Build query
    const query = { school: schoolId };
    if (studentId)
        query.student = studentId;
    if (examId)
        query.exam = examId;
    const studentGrades = await StudentGrade_1.default.find(query)
        .populate('student', 'name studentCode')
        .populate({
        path: 'exam',
        select: 'name type totalMarks passingMarks academicYear',
        populate: [
            { path: 'gradeId', select: 'name' },
            { path: 'subject', select: 'name' }
        ]
    })
        .populate('recordedBy', 'name')
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { studentGrades });
};
exports.getAllStudentGrades = getAllStudentGrades;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE STUDENT GRADE
// ═══════════════════════════════════════════════════════════════
const getOneStudentGrade = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const studentGrade = await StudentGrade_1.default.findOne({ _id: id, school: schoolId })
        .populate('student', 'name studentCode')
        .populate({
        path: 'exam',
        select: 'name type totalMarks passingMarks academicYear',
        populate: [
            { path: 'gradeId', select: 'name' },
            { path: 'subject', select: 'name' }
        ]
    })
        .populate('recordedBy', 'name');
    if (!studentGrade) {
        throw new Errors_1.NotFound('درجة الطالب غير موجودة');
    }
    return (0, response_1.SuccessResponse)(res, { studentGrade });
};
exports.getOneStudentGrade = getOneStudentGrade;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE STUDENT GRADE
// ═══════════════════════════════════════════════════════════════
const createStudentGrade = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { studentId, examId, marks, notes } = req.body;
    // Check if grade already exists for this student and exam
    const existingGrade = await StudentGrade_1.default.findOne({
        school: schoolId,
        student: studentId,
        exam: examId,
    });
    if (existingGrade) {
        throw new BadRequest_1.BadRequest('درجة الطالب موجودة مسبقاً لهذا الامتحان');
    }
    // Get exam to validate marks
    const exam = await Exam_1.default.findById(examId);
    if (!exam) {
        throw new Errors_1.NotFound('الامتحان غير موجود');
    }
    if (marks > exam.totalMarks) {
        throw new BadRequest_1.BadRequest(`الدرجة لا يمكن أن تتجاوز ${exam.totalMarks}`);
    }
    // Determine recordedByModel based on user role
    const recordedByModel = userRole === 'teacher' ? 'Teacher' : 'SchoolAdmin';
    const studentGrade = await StudentGrade_1.default.create({
        school: schoolId,
        student: studentId,
        exam: examId,
        marks,
        recordedBy: userId,
        recordedByModel,
        notes,
    });
    // Populate for response
    await studentGrade.populate('student', 'name studentCode');
    await studentGrade.populate('exam', 'name type totalMarks');
    await studentGrade.populate('recordedBy', 'name');
    return (0, response_1.SuccessResponse)(res, { studentGrade, message: 'تم إضافة درجة الطالب بنجاح' }, 201);
};
exports.createStudentGrade = createStudentGrade;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE STUDENT GRADE
// ═══════════════════════════════════════════════════════════════
const updateStudentGrade = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { marks, notes } = req.body;
    // Check if student grade exists
    const existingGrade = await StudentGrade_1.default.findOne({ _id: id, school: schoolId });
    if (!existingGrade) {
        throw new Errors_1.NotFound('درجة الطالب غير موجودة');
    }
    // Get exam to validate marks
    if (marks !== undefined) {
        const exam = await Exam_1.default.findById(existingGrade.exam);
        if (exam && marks > exam.totalMarks) {
            throw new BadRequest_1.BadRequest(`الدرجة لا يمكن أن تتجاوز ${exam.totalMarks}`);
        }
    }
    // Prepare update data
    const updateData = {};
    if (marks !== undefined)
        updateData.marks = marks;
    if (notes !== undefined)
        updateData.notes = notes;
    const studentGrade = await StudentGrade_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .populate('student', 'name studentCode')
        .populate('exam', 'name type totalMarks')
        .populate('recordedBy', 'name');
    return (0, response_1.SuccessResponse)(res, { studentGrade, message: 'تم تحديث درجة الطالب بنجاح' });
};
exports.updateStudentGrade = updateStudentGrade;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE STUDENT GRADE
// ═══════════════════════════════════════════════════════════════
const removeStudentGrade = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const studentGrade = await StudentGrade_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!studentGrade) {
        throw new Errors_1.NotFound('درجة الطالب غير موجودة');
    }
    return (0, response_1.SuccessResponse)(res, { studentGrade, message: 'تم حذف درجة الطالب بنجاح' });
};
exports.removeStudentGrade = removeStudentGrade;
// ═══════════════════════════════════════════════════════════════
// 📋 SELECT - Get all IDs for dropdown
// ═══════════════════════════════════════════════════════════════
const select = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const [students, exams, grades, classes, subjects] = await Promise.all([
        Student_1.default.find({ school: schoolId, status: 'active' })
            .select('name studentCode gradeId classId')
            .populate('gradeId', 'name')
            .populate('classId', 'name'),
        Exam_1.default.find({ school: schoolId, status: 'active' })
            .select('name type totalMarks academicYear gradeId subject')
            .populate('gradeId', 'name')
            .populate('subject', 'name'),
        Grade_1.default.find({ school: schoolId, status: 'active' }).select('name nameEn'),
        Class_1.default.find({ school: schoolId, status: 'active' }).select('name gradeId').populate('gradeId', 'name'),
        Subject_1.default.find({ school: schoolId, status: 'active' }).select('name nameEn'),
    ]);
    return (0, response_1.SuccessResponse)(res, { students, exams, grades, classes, subjects });
};
exports.select = select;
// ═══════════════════════════════════════════════════════════════
// 📊 GET GRADES BY STUDENT (Report)
// ═══════════════════════════════════════════════════════════════
const getByStudent = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { studentId, academicYear } = req.body;
    if (!studentId) {
        throw new BadRequest_1.BadRequest('الطالب مطلوب');
    }
    const query = { school: schoolId, student: studentId };
    const studentGrades = await StudentGrade_1.default.find(query)
        .populate({
        path: 'exam',
        select: 'name type totalMarks passingMarks academicYear',
        populate: { path: 'subject', select: 'name' },
        match: academicYear ? { academicYear } : {}
    })
        .sort({ createdAt: -1 });
    // Filter out null exams (from academicYear mismatch)
    const filteredGrades = studentGrades.filter(g => g.exam);
    return (0, response_1.SuccessResponse)(res, { studentGrades: filteredGrades });
};
exports.getByStudent = getByStudent;
