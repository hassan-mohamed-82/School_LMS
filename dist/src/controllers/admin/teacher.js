"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTeacher = exports.updateTeacher = exports.createTeacher = exports.getOneTeacher = exports.getAllTeacher = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Teacher_1 = __importDefault(require("../../models/schema/admin/Teacher"));
require("../../models/schema/admin/Subject"); // Import to register schema for populate
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const handleImages_1 = require("../../utils/handleImages");
const BadRequest_1 = require("../../Errors/BadRequest");
// GET /teachers - Get all teachers
const getAllTeacher = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const teachers = await Teacher_1.default.find({ school: schoolId })
        .populate('subjects', 'name nameEn')
        .select('-password')
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { teachers });
};
exports.getAllTeacher = getAllTeacher;
// GET /teachers/:id - Get single teacher
const getOneTeacher = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const teacher = await Teacher_1.default.findOne({ _id: id, school: schoolId })
        .populate('subjects', 'name nameEn')
        .select('-password');
    if (!teacher) {
        throw new Errors_1.NotFound('المدرس غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { teacher });
};
exports.getOneTeacher = getOneTeacher;
// POST /teachers - Create teacher
const createTeacher = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const data = req.body;
    // Check if phone already exists
    const existingTeacher = await Teacher_1.default.findOne({
        school: schoolId,
        phone: data.phone,
    });
    if (existingTeacher) {
        throw new BadRequest_1.BadRequest('رقم الهاتف مسجل مسبقاً');
    }
    // Handle avatar image
    if (data.avatar) {
        data.avatar = await (0, handleImages_1.saveBase64Image)(data.avatar, data.phone, req, 'teachers');
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    const teacher = await Teacher_1.default.create({
        ...data,
        school: schoolId,
        password: hashedPassword,
    });
    // Remove password from response
    const { password: _, ...teacherResponse } = teacher.toObject();
    (0, response_1.SuccessResponse)(res, { teacher: teacherResponse, message: 'تم إضافة المدرس بنجاح' }, 201);
};
exports.createTeacher = createTeacher;
// PUT /teachers/:id - Update teacher (includes status & password)
const updateTeacher = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const data = req.body;
    // Check if phone already exists (if updating phone)
    if (data.phone) {
        const existingTeacher = await Teacher_1.default.findOne({
            school: schoolId,
            phone: data.phone,
            _id: { $ne: id },
        });
        if (existingTeacher) {
            throw new BadRequest_1.BadRequest('رقم الهاتف مسجل مسبقاً');
        }
    }
    // Handle avatar image
    if (data.avatar && data.avatar.startsWith('data:image')) {
        data.avatar = await (0, handleImages_1.saveBase64Image)(data.avatar, data.phone, req, 'teachers');
    }
    // Handle password change
    if (data.password) {
        data.password = await bcryptjs_1.default.hash(data.password, 10);
    }
    const teacher = await Teacher_1.default.findOneAndUpdate({ _id: id, school: schoolId }, { $set: data }, { new: true })
        .populate('subjects', 'name nameEn')
        .select('-password');
    if (!teacher) {
        throw new Errors_1.NotFound('المدرس غير موجود');
    }
    (0, response_1.SuccessResponse)(res, { teacher, message: 'تم تحديث بيانات المدرس بنجاح' });
};
exports.updateTeacher = updateTeacher;
// DELETE /teachers/:id - Delete teacher
const removeTeacher = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const teacher = await Teacher_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!teacher) {
        throw new Errors_1.NotFound('المدرس غير موجود');
    }
    (0, response_1.SuccessResponse)(res, { teacher, message: 'تم حذف المدرس بنجاح' });
};
exports.removeTeacher = removeTeacher;
