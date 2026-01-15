"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeClass = exports.updateClass = exports.createClass = exports.getOneClass = exports.getAllClasses = void 0;
const Class_1 = __importDefault(require("../../models/schema/admin/Class"));
require("../../models/schema/admin/Grade"); // Register Grade schema for populate
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL CLASSES
// ═══════════════════════════════════════════════════════════════
const getAllClasses = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, status } = req.query;
    // Build query
    const query = { school: schoolId };
    if (gradeId)
        query.gradeId = gradeId;
    if (status)
        query.status = status;
    const classes = await Class_1.default.find(query)
        .populate('grade', 'name nameEn')
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { classes });
};
exports.getAllClasses = getAllClasses;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE CLASS
// ═══════════════════════════════════════════════════════════════
const getOneClass = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const classDoc = await Class_1.default.findOne({ _id: id, school: schoolId })
        .populate('gradeId', 'name nameEn');
    if (!classDoc) {
        throw new Errors_1.NotFound('الفصل غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { class: classDoc });
};
exports.getOneClass = getOneClass;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE CLASS
// ═══════════════════════════════════════════════════════════════
const createClass = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, name, capacity, status } = req.body;
    // Check if class name already exists in this grade
    const existingClass = await Class_1.default.findOne({
        school: schoolId,
        gradeId: gradeId,
        name: name,
    });
    if (existingClass) {
        throw new BadRequest_1.BadRequest('اسم الفصل موجود مسبقاً في هذه المرحلة');
    }
    const classDoc = await Class_1.default.create({
        school: schoolId,
        gradeId,
        name,
        capacity,
        status: status || 'active',
    });
    // Populate grade for response
    await classDoc.populate('grade', 'name nameEn');
    return (0, response_1.SuccessResponse)(res, { class: classDoc, message: 'تم إضافة الفصل بنجاح' }, 201);
};
exports.createClass = createClass;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE CLASS
// ═══════════════════════════════════════════════════════════════
const updateClass = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { gradeId, name, capacity, status } = req.body;
    // Check if class exists
    const existingClass = await Class_1.default.findOne({ _id: id, school: schoolId });
    if (!existingClass) {
        throw new Errors_1.NotFound('الفصل غير موجود');
    }
    // Check if name already exists in the same grade (excluding current class)
    if (name || gradeId) {
        const checkGrade = gradeId || existingClass.gradeId;
        const checkName = name || existingClass.name;
        const duplicateClass = await Class_1.default.findOne({
            school: schoolId,
            gradeId: checkGrade,
            name: checkName,
            _id: { $ne: id },
        });
        if (duplicateClass) {
            throw new BadRequest_1.BadRequest('اسم الفصل موجود مسبقاً في هذه المرحلة');
        }
    }
    // Prepare update data
    const updateData = {};
    if (gradeId !== undefined)
        updateData.gradeId = gradeId;
    if (name !== undefined)
        updateData.name = name;
    if (capacity !== undefined)
        updateData.capacity = capacity;
    if (status !== undefined)
        updateData.status = status;
    const classDoc = await Class_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true }).populate('grade', 'name nameEn');
    return (0, response_1.SuccessResponse)(res, { class: classDoc, message: 'تم تحديث الفصل بنجاح' });
};
exports.updateClass = updateClass;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE CLASS
// ═══════════════════════════════════════════════════════════════
const removeClass = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const classDoc = await Class_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!classDoc) {
        throw new Errors_1.NotFound('الفصل غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { class: classDoc, message: 'تم حذف الفصل بنجاح' });
};
exports.removeClass = removeClass;
