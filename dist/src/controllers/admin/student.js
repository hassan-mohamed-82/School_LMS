"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchByParentPhone = exports.select = exports.removeStudent = exports.updateStudent = exports.createStudent = exports.getOneStudent = exports.getAllStudents = void 0;
const Student_1 = __importDefault(require("../../models/schema/admin/Student"));
require("../../models/schema/admin/Parent"); // Register Parent schema for populate
require("../../models/schema/admin/Grade"); // Register Grade schema for populate
require("../../models/schema/admin/Class"); // Register Class schema for populate
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const Grade_1 = __importDefault(require("../../models/schema/admin/Grade"));
const Parent_1 = __importDefault(require("../../models/schema/admin/Parent"));
const Class_1 = __importDefault(require("../../models/schema/admin/Class"));
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL STUDENTS
// ═══════════════════════════════════════════════════════════════
const getAllStudents = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, classId, parentId, status } = req.query;
    // Build query
    const query = { school: schoolId };
    if (gradeId)
        query.gradeId = gradeId;
    if (classId)
        query.classId = classId;
    if (parentId)
        query.parentId = parentId;
    if (status)
        query.status = status;
    const students = await Student_1.default.find(query)
        .populate('parentId', 'name phone')
        .populate('gradeId', 'name nameEn')
        .populate('classId', 'name')
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { students });
};
exports.getAllStudents = getAllStudents;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE STUDENT
// ═══════════════════════════════════════════════════════════════
const getOneStudent = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const student = await Student_1.default.findOne({ _id: id, school: schoolId })
        .populate('parentId', 'name phone address')
        .populate('gradeId', 'name nameEn')
        .populate('classId', 'name');
    if (!student) {
        throw new Errors_1.NotFound('الطالب غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { student });
};
exports.getOneStudent = getOneStudent;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE STUDENT
// ═══════════════════════════════════════════════════════════════
const createStudent = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { parentId, gradeId, classId, name, studentCode, gender, dateOfBirth, address, avatar, status } = req.body;
    // Check if studentCode already exists (if provided)
    if (studentCode) {
        const existingStudent = await Student_1.default.findOne({
            school: schoolId,
            studentCode: studentCode,
        });
        if (existingStudent) {
            throw new BadRequest_1.BadRequest('كود الطالب موجود مسبقاً');
        }
    }
    const student = await Student_1.default.create({
        school: schoolId,
        parentId,
        gradeId,
        classId,
        name,
        studentCode,
        gender,
        dateOfBirth,
        address,
        avatar,
        status: status || 'active',
    });
    // Populate for response
    await student.populate('parentId', 'name phone');
    await student.populate('gradeId', 'name nameEn');
    await student.populate('classId', 'name');
    return (0, response_1.SuccessResponse)(res, { student, message: 'تم إضافة الطالب بنجاح' }, 201);
};
exports.createStudent = createStudent;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE STUDENT
// ═══════════════════════════════════════════════════════════════
const updateStudent = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { parentId, gradeId, classId, name, studentCode, gender, dateOfBirth, address, avatar, status } = req.body;
    // Check if student exists
    const existingStudent = await Student_1.default.findOne({ _id: id, school: schoolId });
    if (!existingStudent) {
        throw new Errors_1.NotFound('الطالب غير موجود');
    }
    // Check if studentCode already exists (if updating)
    if (studentCode && studentCode !== existingStudent.studentCode) {
        const duplicateStudent = await Student_1.default.findOne({
            school: schoolId,
            studentCode: studentCode,
            _id: { $ne: id },
        });
        if (duplicateStudent) {
            throw new BadRequest_1.BadRequest('كود الطالب موجود مسبقاً');
        }
    }
    // Prepare update data
    const updateData = {};
    if (parentId !== undefined)
        updateData.parentId = parentId;
    if (gradeId !== undefined)
        updateData.gradeId = gradeId;
    if (classId !== undefined)
        updateData.classId = classId;
    if (name !== undefined)
        updateData.name = name;
    if (studentCode !== undefined)
        updateData.studentCode = studentCode;
    if (gender !== undefined)
        updateData.gender = gender;
    if (dateOfBirth !== undefined)
        updateData.dateOfBirth = dateOfBirth;
    if (address !== undefined)
        updateData.address = address;
    if (avatar !== undefined)
        updateData.avatar = avatar;
    if (status !== undefined)
        updateData.status = status;
    const student = await Student_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .populate('parentId', 'name phone')
        .populate('gradeId', 'name nameEn')
        .populate('classId', 'name');
    return (0, response_1.SuccessResponse)(res, { student, message: 'تم تحديث بيانات الطالب بنجاح' });
};
exports.updateStudent = updateStudent;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE STUDENT
// ═══════════════════════════════════════════════════════════════
const removeStudent = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const student = await Student_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!student) {
        throw new Errors_1.NotFound('الطالب غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { student, message: 'تم حذف الطالب بنجاح' });
};
exports.removeStudent = removeStudent;
const select = async (req, res) => {
    const grade = await Grade_1.default.find({ school: req.user?.schoolId });
    const classes = await Class_1.default.find({ school: req.user?.schoolId });
    const parent = await Parent_1.default.find({ school: req.user?.schoolId });
    (0, response_1.SuccessResponse)(res, { grade, classes, parent });
};
exports.select = select;
// ═══════════════════════════════════════════════════════════════
// 🔍 SEARCH STUDENTS BY PARENT PHONE
// ═══════════════════════════════════════════════════════════════
const searchByParentPhone = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { phone } = req.query;
    if (!phone) {
        throw new BadRequest_1.BadRequest('رقم الهاتف مطلوب للبحث');
    }
    // First, find the parent by phone
    const parent = await Parent_1.default.findOne({
        school: schoolId,
        phone: { $regex: phone, $options: 'i' }
    });
    if (!parent) {
        return (0, response_1.SuccessResponse)(res, { students: [], message: 'لا يوجد ولي أمر بهذا الرقم' });
    }
    // Then find students associated with this parent
    const students = await Student_1.default.find({
        school: schoolId,
        parentId: parent._id
    })
        .populate('parentId', 'name phone address')
        .populate('gradeId', 'name nameEn')
        .populate('classId', 'name')
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { students, parent: { name: parent.name, phone: parent.phone } });
};
exports.searchByParentPhone = searchByParentPhone;
