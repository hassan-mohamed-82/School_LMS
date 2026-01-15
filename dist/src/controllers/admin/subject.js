"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSubject = exports.updateSubject = exports.createSubject = exports.getOneSubject = exports.getAllSubjects = void 0;
const Subject_1 = __importDefault(require("../../models/schema/admin/Subject"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL SUBJECTS
// ═══════════════════════════════════════════════════════════════
const getAllSubjects = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { status } = req.query;
    // Build query
    const query = { school: schoolId };
    if (status)
        query.status = status;
    const subjects = await Subject_1.default.find(query)
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { subjects });
};
exports.getAllSubjects = getAllSubjects;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE SUBJECT
// ═══════════════════════════════════════════════════════════════
const getOneSubject = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const subject = await Subject_1.default.findOne({ _id: id, school: schoolId });
    if (!subject) {
        throw new Errors_1.NotFound('المادة غير موجودة');
    }
    return (0, response_1.SuccessResponse)(res, { subject });
};
exports.getOneSubject = getOneSubject;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE SUBJECT
// ═══════════════════════════════════════════════════════════════
const createSubject = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { name, nameEn, code, status } = req.body;
    // Check if subject name already exists in this school
    const existingSubject = await Subject_1.default.findOne({
        school: schoolId,
        name: name,
    });
    if (existingSubject) {
        throw new BadRequest_1.BadRequest('اسم المادة موجود مسبقاً');
    }
    const subject = await Subject_1.default.create({
        school: schoolId,
        name,
        nameEn,
        code,
        status: status || 'active',
    });
    return (0, response_1.SuccessResponse)(res, { subject, message: 'تم إضافة المادة بنجاح' }, 201);
};
exports.createSubject = createSubject;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE SUBJECT
// ═══════════════════════════════════════════════════════════════
const updateSubject = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, nameEn, code, status } = req.body;
    // Check if subject exists
    const existingSubject = await Subject_1.default.findOne({ _id: id, school: schoolId });
    if (!existingSubject) {
        throw new Errors_1.NotFound('المادة غير موجودة');
    }
    // Check if name already exists (excluding current subject)
    if (name && name !== existingSubject.name) {
        const duplicateSubject = await Subject_1.default.findOne({
            school: schoolId,
            name: name,
            _id: { $ne: id },
        });
        if (duplicateSubject) {
            throw new BadRequest_1.BadRequest('اسم المادة موجود مسبقاً');
        }
    }
    // Prepare update data
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (nameEn !== undefined)
        updateData.nameEn = nameEn;
    if (code !== undefined)
        updateData.code = code;
    if (status !== undefined)
        updateData.status = status;
    const subject = await Subject_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return (0, response_1.SuccessResponse)(res, { subject, message: 'تم تحديث المادة بنجاح' });
};
exports.updateSubject = updateSubject;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE SUBJECT
// ═══════════════════════════════════════════════════════════════
const removeSubject = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const subject = await Subject_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!subject) {
        throw new Errors_1.NotFound('المادة غير موجودة');
    }
    return (0, response_1.SuccessResponse)(res, { subject, message: 'تم حذف المادة بنجاح' });
};
exports.removeSubject = removeSubject;
