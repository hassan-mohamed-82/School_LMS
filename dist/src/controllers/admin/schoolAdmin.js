"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableModules = exports.getPermissions = exports.select = exports.removeSchoolAdmin = exports.updateSchoolAdmin = exports.createSchoolAdmin = exports.getOneSchoolAdmin = exports.getAllSchoolAdmins = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SchoolAdmin_1 = __importDefault(require("../../models/schema/admin/SchoolAdmin"));
const SchoolAdminRole_1 = __importDefault(require("../../models/schema/admin/SchoolAdminRole"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const handleImages_1 = require("../../utils/handleImages");
const constant_1 = require("../../types/constant");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL SCHOOL ADMINS
// ═══════════════════════════════════════════════════════════════
const getAllSchoolAdmins = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { status, type } = req.query;
    const query = { school: schoolId };
    if (status)
        query.status = status;
    if (type)
        query.type = type;
    const admins = await SchoolAdmin_1.default.find(query)
        .populate({
        path: 'role',
        select: 'name permissions',
    })
        .select('-password')
        .sort({ createdAt: -1 });
    const formattedAdmins = admins.map(admin => formatAdminWithPermissions(admin));
    return (0, response_1.SuccessResponse)(res, { admins: formattedAdmins });
};
exports.getAllSchoolAdmins = getAllSchoolAdmins;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE SCHOOL ADMIN
// ═══════════════════════════════════════════════════════════════
const getOneSchoolAdmin = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const admin = await SchoolAdmin_1.default.findOne({ _id: id, school: schoolId })
        .populate({
        path: 'role',
        select: 'name permissions',
    })
        .select('-password');
    if (!admin) {
        throw new Errors_1.NotFound('المشرف غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { admin: formatAdminWithPermissions(admin) });
};
exports.getOneSchoolAdmin = getOneSchoolAdmin;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE SCHOOL ADMIN
// ═══════════════════════════════════════════════════════════════
const createSchoolAdmin = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { name, email, password, phone, type, roleId, avatar, status } = req.body;
    // Check if email already exists
    const existingAdmin = await SchoolAdmin_1.default.findOne({
        school: schoolId,
        phone: phone,
    });
    if (existingAdmin) {
        throw new BadRequest_1.BadRequest('رقم الهاتف مسجل مسبقاً');
    }
    // Check if role exists
    const role = await SchoolAdminRole_1.default.findOne({ _id: roleId, school: schoolId });
    if (!role) {
        throw new Errors_1.NotFound('الدور غير موجود');
    }
    // Handle avatar
    let avatarUrl = avatar;
    if (avatar && avatar.startsWith('data:image')) {
        const uniqueId = new Date().getTime().toString();
        avatarUrl = await (0, handleImages_1.saveBase64Image)(avatar, uniqueId, req, 'admins');
    }
    // Hash password
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const admin = await SchoolAdmin_1.default.create({
        school: schoolId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        type: type || 'admin',
        role: roleId,
        avatar: avatarUrl,
        status: status || 'active',
    });
    await admin.populate({
        path: 'role',
        select: 'name permissions',
    });
    const { password: _, ...adminResponse } = admin.toObject();
    return (0, response_1.SuccessResponse)(res, {
        admin: formatAdminWithPermissions(admin),
        message: 'تم إضافة المشرف بنجاح'
    }, 201);
};
exports.createSchoolAdmin = createSchoolAdmin;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE SCHOOL ADMIN
// ═══════════════════════════════════════════════════════════════
const updateSchoolAdmin = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, email, password, phone, type, roleId, avatar, status } = req.body;
    const existingAdmin = await SchoolAdmin_1.default.findOne({ _id: id, school: schoolId });
    if (!existingAdmin) {
        throw new Errors_1.NotFound('المشرف غير موجود');
    }
    // Check email uniqueness
    if (email) {
        const emailExists = await SchoolAdmin_1.default.findOne({
            school: schoolId,
            email: email.toLowerCase(),
            _id: { $ne: id },
        });
        if (emailExists) {
            throw new BadRequest_1.BadRequest('البريد الإلكتروني مسجل مسبقاً');
        }
    }
    // Check role exists
    if (roleId) {
        const role = await SchoolAdminRole_1.default.findOne({ _id: roleId, school: schoolId });
        if (!role) {
            throw new Errors_1.NotFound('الدور غير موجود');
        }
    }
    // Prepare update data
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (email !== undefined)
        updateData.email = email.toLowerCase();
    if (phone !== undefined)
        updateData.phone = phone;
    if (type !== undefined)
        updateData.type = type;
    if (roleId !== undefined)
        updateData.role = roleId;
    if (status !== undefined)
        updateData.status = status;
    if (avatar) {
        updateData.avatar = avatar.startsWith('data:image')
            ? await (0, handleImages_1.saveBase64Image)(avatar, existingAdmin._id.toString(), req, 'admins')
            : avatar;
    }
    if (password) {
        updateData.password = await bcryptjs_1.default.hash(password, 10);
    }
    const admin = await SchoolAdmin_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true })
        .populate({
        path: 'role',
        select: 'name permissions',
    })
        .select('-password');
    return (0, response_1.SuccessResponse)(res, {
        admin: formatAdminWithPermissions(admin),
        message: 'تم تحديث بيانات المشرف بنجاح'
    });
};
exports.updateSchoolAdmin = updateSchoolAdmin;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE SCHOOL ADMIN
// ═══════════════════════════════════════════════════════════════
const removeSchoolAdmin = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const currentUserId = req.user?.id;
    const { id } = req.params;
    if (id === currentUserId) {
        throw new BadRequest_1.BadRequest('لا يمكنك حذف حسابك الخاص');
    }
    const admin = await SchoolAdmin_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!admin) {
        throw new Errors_1.NotFound('المشرف غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { message: 'تم حذف المشرف بنجاح' });
};
exports.removeSchoolAdmin = removeSchoolAdmin;
// ═══════════════════════════════════════════════════════════════
// 📋 SELECT - Get roles for dropdown
// ═══════════════════════════════════════════════════════════════
const select = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const roles = await SchoolAdminRole_1.default.find({ school: schoolId, status: 'active' })
        .select('name permissions');
    const adminTypes = [
        { value: 'organizer', label: 'منظم' },
        { value: 'admin', label: 'مشرف' },
    ];
    return (0, response_1.SuccessResponse)(res, { roles, adminTypes });
};
exports.select = select;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ADMIN PERMISSIONS
// ═══════════════════════════════════════════════════════════════
const getPermissions = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const admin = await SchoolAdmin_1.default.findOne({ _id: id, school: schoolId })
        .populate({
        path: 'role',
        select: 'name permissions',
    });
    if (!admin) {
        throw new Errors_1.NotFound('المشرف غير موجود');
    }
    const permissions = admin.role?.permissions || [];
    return (0, response_1.SuccessResponse)(res, {
        adminId: admin._id,
        adminName: admin.name,
        roleName: admin.role?.name || 'بدون دور',
        permissions: formatPermissions(permissions),
    });
};
exports.getPermissions = getPermissions;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL AVAILABLE MODULES (for creating roles)
// ═══════════════════════════════════════════════════════════════
const getAvailableModules = async (req, res) => {
    const modules = (0, constant_1.getAllModulesWithActions)();
    return (0, response_1.SuccessResponse)(res, { modules });
};
exports.getAvailableModules = getAvailableModules;
// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Format Admin with Permissions
// ═══════════════════════════════════════════════════════════════
const formatAdminWithPermissions = (admin) => {
    const adminObj = admin.toObject ? admin.toObject() : admin;
    const permissions = adminObj.role?.permissions || [];
    return {
        _id: adminObj._id,
        name: adminObj.name,
        email: adminObj.email,
        phone: adminObj.phone,
        type: adminObj.type,
        avatar: adminObj.avatar,
        status: adminObj.status,
        role: adminObj.role ? {
            _id: adminObj.role._id,
            name: adminObj.role.name,
        } : null,
        permissions: formatPermissions(permissions),
        createdAt: adminObj.createdAt,
        updatedAt: adminObj.updatedAt,
    };
};
// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Format Permissions
// ═══════════════════════════════════════════════════════════════
const formatPermissions = (permissions) => {
    return permissions.map(perm => ({
        module: perm.module,
        moduleLabel: constant_1.MODULE_LABELS[perm.module] || perm.module,
        actions: perm.actions.map((act) => ({
            id: act.id,
            action: act.action,
            actionLabel: constant_1.ACTION_LABELS[act.action] || act.action,
        })),
    }));
};
