"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeGrade = exports.updateGrade = exports.createGrade = exports.getOneGrade = exports.getAllGrades = void 0;
const Grade_1 = __importDefault(require("../../models/schema/admin/Grade"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL GRADES
// ═══════════════════════════════════════════════════════════════
const getAllGrades = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const grades = await Grade_1.default.find({ school: schoolId })
        .sort({ sortOrder: 1, createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { grades });
};
exports.getAllGrades = getAllGrades;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE GRADE
// ═══════════════════════════════════════════════════════════════
const getOneGrade = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const grade = await Grade_1.default.findOne({ _id: id, school: schoolId });
    if (!grade) {
        throw new Errors_1.NotFound('المرحلة غير موجودة');
    }
    return (0, response_1.SuccessResponse)(res, { grade });
};
exports.getOneGrade = getOneGrade;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE GRADE
// ═══════════════════════════════════════════════════════════════
const createGrade = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { name, nameEn, sortOrder, status } = req.body;
    // Check if grade name already exists in this school
    const existingGrade = await Grade_1.default.findOne({
        school: schoolId,
        name: name,
    });
    if (existingGrade) {
        throw new BadRequest_1.BadRequest('اسم المرحلة موجود مسبقاً');
    }
    const grade = await Grade_1.default.create({
        school: schoolId,
        name,
        nameEn,
        sortOrder: sortOrder || 0,
        status: status || 'active',
    });
    return (0, response_1.SuccessResponse)(res, { grade, message: 'تم إضافة المرحلة بنجاح' }, 201);
};
exports.createGrade = createGrade;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE GRADE
// ═══════════════════════════════════════════════════════════════
const updateGrade = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, nameEn, sortOrder, status } = req.body;
    // Check if grade exists
    const existingGrade = await Grade_1.default.findOne({ _id: id, school: schoolId });
    if (!existingGrade) {
        throw new Errors_1.NotFound('المرحلة غير موجودة');
    }
    // Check if name already exists (excluding current grade)
    if (name && name !== existingGrade.name) {
        const duplicateGrade = await Grade_1.default.findOne({
            school: schoolId,
            name: name,
            _id: { $ne: id },
        });
        if (duplicateGrade) {
            throw new BadRequest_1.BadRequest('اسم المرحلة موجود مسبقاً');
        }
    }
    // Prepare update data
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (nameEn !== undefined)
        updateData.nameEn = nameEn;
    if (sortOrder !== undefined)
        updateData.sortOrder = sortOrder;
    if (status !== undefined)
        updateData.status = status;
    const grade = await Grade_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return (0, response_1.SuccessResponse)(res, { grade, message: 'تم تحديث المرحلة بنجاح' });
};
exports.updateGrade = updateGrade;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE GRADE
// ═══════════════════════════════════════════════════════════════
const removeGrade = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const grade = await Grade_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!grade) {
        throw new Errors_1.NotFound('المرحلة غير موجودة');
    }
    return (0, response_1.SuccessResponse)(res, { grade, message: 'تم حذف المرحلة بنجاح' });
};
exports.removeGrade = removeGrade;
