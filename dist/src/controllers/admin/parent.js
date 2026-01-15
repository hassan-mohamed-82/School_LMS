"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeParent = exports.updateParent = exports.createParent = exports.getOneParent = exports.getAllParents = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Parent_1 = __importDefault(require("../../models/schema/admin/Parent"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL PARENTS
// ═══════════════════════════════════════════════════════════════
const getAllParents = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { status } = req.query;
    // Build query
    const query = { school: schoolId };
    if (status)
        query.status = status;
    const parents = await Parent_1.default.find(query)
        .select('-password')
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { parents });
};
exports.getAllParents = getAllParents;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE PARENT
// ═══════════════════════════════════════════════════════════════
const getOneParent = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const parent = await Parent_1.default.findOne({ _id: id, school: schoolId })
        .select('-password');
    if (!parent) {
        throw new Errors_1.NotFound('ولي الأمر غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { parent });
};
exports.getOneParent = getOneParent;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE PARENT
// ═══════════════════════════════════════════════════════════════
const createParent = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { name, phone, password, address, avatar, status } = req.body;
    // Check if phone already exists
    const existingParent = await Parent_1.default.findOne({
        school: schoolId,
        phone: phone,
    });
    if (existingParent) {
        throw new BadRequest_1.BadRequest('رقم الهاتف مسجل مسبقاً');
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const parent = await Parent_1.default.create({
        school: schoolId,
        name,
        phone,
        password: hashedPassword,
        address,
        avatar,
        status: status || 'active',
    });
    // Remove password from response
    const { password: _, ...parentResponse } = parent.toObject();
    return (0, response_1.SuccessResponse)(res, { parent: parentResponse, message: 'تم إضافة ولي الأمر بنجاح' }, 201);
};
exports.createParent = createParent;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PARENT
// ═══════════════════════════════════════════════════════════════
const updateParent = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, phone, password, address, avatar, status } = req.body;
    // Check if parent exists
    const existingParent = await Parent_1.default.findOne({ _id: id, school: schoolId });
    if (!existingParent) {
        throw new Errors_1.NotFound('ولي الأمر غير موجود');
    }
    // Check if phone already exists (if updating phone)
    if (phone && phone !== existingParent.phone) {
        const duplicateParent = await Parent_1.default.findOne({
            school: schoolId,
            phone: phone,
            _id: { $ne: id },
        });
        if (duplicateParent) {
            throw new BadRequest_1.BadRequest('رقم الهاتف مسجل مسبقاً');
        }
    }
    // Prepare update data
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (phone !== undefined)
        updateData.phone = phone;
    if (address !== undefined)
        updateData.address = address;
    if (avatar !== undefined)
        updateData.avatar = avatar;
    if (status !== undefined)
        updateData.status = status;
    // Handle password change
    if (password) {
        updateData.password = await bcryptjs_1.default.hash(password, 10);
    }
    const parent = await Parent_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select('-password');
    return (0, response_1.SuccessResponse)(res, { parent, message: 'تم تحديث بيانات ولي الأمر بنجاح' });
};
exports.updateParent = updateParent;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE PARENT
// ═══════════════════════════════════════════════════════════════
const removeParent = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const parent = await Parent_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!parent) {
        throw new Errors_1.NotFound('ولي الأمر غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { parent, message: 'تم حذف ولي الأمر بنجاح' });
};
exports.removeParent = removeParent;
