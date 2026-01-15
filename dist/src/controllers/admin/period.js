"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePeriod = exports.updatePeriod = exports.createPeriod = exports.getOnePeriod = exports.getAllPeriods = void 0;
const Period_1 = __importDefault(require("../../models/schema/admin/Period"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL PERIODS
// ═══════════════════════════════════════════════════════════════
const getAllPeriods = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { status } = req.query;
    // Build query
    const query = { school: schoolId };
    if (status)
        query.status = status;
    const periods = await Period_1.default.find(query)
        .sort({ sortOrder: 1, startTime: 1 });
    return (0, response_1.SuccessResponse)(res, { periods });
};
exports.getAllPeriods = getAllPeriods;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE PERIOD
// ═══════════════════════════════════════════════════════════════
const getOnePeriod = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const period = await Period_1.default.findOne({ _id: id, school: schoolId });
    if (!period) {
        throw new Errors_1.NotFound('الحصة غير موجودة');
    }
    return (0, response_1.SuccessResponse)(res, { period });
};
exports.getOnePeriod = getOnePeriod;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE PERIOD
// ═══════════════════════════════════════════════════════════════
const createPeriod = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { name, nameEn, startTime, endTime, sortOrder, status } = req.body;
    // Check if period name already exists in this school
    const existingPeriod = await Period_1.default.findOne({
        school: schoolId,
        name: name,
    });
    if (existingPeriod) {
        throw new BadRequest_1.BadRequest('اسم الحصة موجود مسبقاً');
    }
    const period = await Period_1.default.create({
        school: schoolId,
        name,
        nameEn,
        startTime,
        endTime,
        sortOrder: sortOrder || 0,
        status: status || 'active',
    });
    return (0, response_1.SuccessResponse)(res, { period, message: 'تم إضافة الحصة بنجاح' }, 201);
};
exports.createPeriod = createPeriod;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PERIOD
// ═══════════════════════════════════════════════════════════════
const updatePeriod = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, nameEn, startTime, endTime, sortOrder, status } = req.body;
    // Check if period exists
    const existingPeriod = await Period_1.default.findOne({ _id: id, school: schoolId });
    if (!existingPeriod) {
        throw new Errors_1.NotFound('الحصة غير موجودة');
    }
    // Check if name already exists (excluding current period)
    if (name && name !== existingPeriod.name) {
        const duplicatePeriod = await Period_1.default.findOne({
            school: schoolId,
            name: name,
            _id: { $ne: id },
        });
        if (duplicatePeriod) {
            throw new BadRequest_1.BadRequest('اسم الحصة موجود مسبقاً');
        }
    }
    // Prepare update data
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (nameEn !== undefined)
        updateData.nameEn = nameEn;
    if (startTime !== undefined)
        updateData.startTime = startTime;
    if (endTime !== undefined)
        updateData.endTime = endTime;
    if (sortOrder !== undefined)
        updateData.sortOrder = sortOrder;
    if (status !== undefined)
        updateData.status = status;
    const period = await Period_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return (0, response_1.SuccessResponse)(res, { period, message: 'تم تحديث الحصة بنجاح' });
};
exports.updatePeriod = updatePeriod;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE PERIOD
// ═══════════════════════════════════════════════════════════════
const removePeriod = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const period = await Period_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!period) {
        throw new Errors_1.NotFound('الحصة غير موجودة');
    }
    return (0, response_1.SuccessResponse)(res, { period, message: 'تم حذف الحصة بنجاح' });
};
exports.removePeriod = removePeriod;
