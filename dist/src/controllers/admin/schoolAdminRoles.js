"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminsByRole = exports.getAvailableModules = exports.removeRole = exports.updateRole = exports.createRole = exports.getOneRole = exports.getAllRoles = void 0;
const SchoolAdminRole_1 = __importDefault(require("../../models/schema/admin/SchoolAdminRole"));
const SchoolAdmin_1 = __importDefault(require("../../models/schema/admin/SchoolAdmin"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const constant_1 = require("../../types/constant");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL ROLES
// ═══════════════════════════════════════════════════════════════
const getAllRoles = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { status } = req.query;
    const query = { school: schoolId };
    if (status)
        query.status = status;
    const roles = await SchoolAdminRole_1.default.find(query).sort({ createdAt: -1 });
    const formattedRoles = roles.map(role => formatRoleWithLabels(role));
    return (0, response_1.SuccessResponse)(res, { roles: formattedRoles });
};
exports.getAllRoles = getAllRoles;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE ROLE
// ═══════════════════════════════════════════════════════════════
const getOneRole = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const role = await SchoolAdminRole_1.default.findOne({ _id: id, school: schoolId });
    if (!role) {
        throw new Errors_1.NotFound('الدور غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { role: formatRoleWithLabels(role) });
};
exports.getOneRole = getOneRole;
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE ROLE
// ═══════════════════════════════════════════════════════════════
const createRole = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { name, permissions, status } = req.body;
    // Check if role name already exists
    const existingRole = await SchoolAdminRole_1.default.findOne({
        school: schoolId,
        name: name.trim(),
    });
    if (existingRole) {
        throw new BadRequest_1.BadRequest('اسم الدور موجود مسبقاً');
    }
    // Validate permissions against available modules
    const validationError = validatePermissions(permissions);
    if (validationError) {
        throw new BadRequest_1.BadRequest(validationError);
    }
    const role = await SchoolAdminRole_1.default.create({
        school: schoolId,
        name: name.trim(),
        permissions,
        status: status || 'active',
    });
    return (0, response_1.SuccessResponse)(res, {
        role: formatRoleWithLabels(role),
        message: 'تم إضافة الدور بنجاح'
    }, 201);
};
exports.createRole = createRole;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE ROLE
// ═══════════════════════════════════════════════════════════════
const updateRole = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, permissions, status } = req.body;
    // Check if role exists
    const existingRole = await SchoolAdminRole_1.default.findOne({ _id: id, school: schoolId });
    if (!existingRole) {
        throw new Errors_1.NotFound('الدور غير موجود');
    }
    // Check if name already exists (if updating name)
    if (name) {
        const nameExists = await SchoolAdminRole_1.default.findOne({
            school: schoolId,
            name: name.trim(),
            _id: { $ne: id },
        });
        if (nameExists) {
            throw new BadRequest_1.BadRequest('اسم الدور موجود مسبقاً');
        }
    }
    // Validate permissions if provided
    if (permissions) {
        const validationError = validatePermissions(permissions);
        if (validationError) {
            throw new BadRequest_1.BadRequest(validationError);
        }
    }
    // Prepare update data
    const updateData = {};
    if (name !== undefined)
        updateData.name = name.trim();
    if (permissions !== undefined)
        updateData.permissions = permissions;
    if (status !== undefined)
        updateData.status = status;
    const role = await SchoolAdminRole_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    return (0, response_1.SuccessResponse)(res, {
        role: formatRoleWithLabels(role),
        message: 'تم تحديث الدور بنجاح'
    });
};
exports.updateRole = updateRole;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE ROLE
// ═══════════════════════════════════════════════════════════════
const removeRole = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    // Check if role is assigned to any admin
    const adminsWithRole = await SchoolAdmin_1.default.countDocuments({
        school: schoolId,
        role: id,
    });
    if (adminsWithRole > 0) {
        throw new BadRequest_1.BadRequest(`لا يمكن حذف الدور لأنه مرتبط بـ ${adminsWithRole} مشرف`);
    }
    const role = await SchoolAdminRole_1.default.findOneAndDelete({
        _id: id,
        school: schoolId,
    });
    if (!role) {
        throw new Errors_1.NotFound('الدور غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { message: 'تم حذف الدور بنجاح' });
};
exports.removeRole = removeRole;
// ═══════════════════════════════════════════════════════════════
// 📋 GET AVAILABLE MODULES
// ═══════════════════════════════════════════════════════════════
const getAvailableModules = async (req, res) => {
    const modules = (0, constant_1.getAllModulesWithActions)();
    return (0, response_1.SuccessResponse)(res, { modules });
};
exports.getAvailableModules = getAvailableModules;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ADMINS BY ROLE
// ═══════════════════════════════════════════════════════════════
const getAdminsByRole = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    // Check if role exists
    const role = await SchoolAdminRole_1.default.findOne({ _id: id, school: schoolId });
    if (!role) {
        throw new Errors_1.NotFound('الدور غير موجود');
    }
    const admins = await SchoolAdmin_1.default.find({
        school: schoolId,
        role: id,
    }).select('name email phone status createdAt');
    return (0, response_1.SuccessResponse)(res, {
        role: {
            _id: role._id,
            name: role.name,
        },
        admins,
        count: admins.length,
    });
};
exports.getAdminsByRole = getAdminsByRole;
// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Validate Permissions
// ═══════════════════════════════════════════════════════════════
const validatePermissions = (permissions) => {
    for (const perm of permissions) {
        // Check if module exists
        if (!constant_1.SCHOOL_ADMIN_MODULES.hasOwnProperty(perm.module)) {
            return `الموديول "${perm.module}" غير موجود`;
        }
        // Check if actions are valid for this module
        const validActions = constant_1.SCHOOL_ADMIN_MODULES[perm.module];
        for (const act of perm.actions) {
            if (!validActions.includes(act.action)) {
                return `الإجراء "${act.action}" غير متاح للموديول "${perm.module}"`;
            }
        }
    }
    return null;
};
// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Format Role with Labels
// ═══════════════════════════════════════════════════════════════
const formatRoleWithLabels = (role) => {
    const roleObj = role.toObject ? role.toObject() : role;
    return {
        _id: roleObj._id,
        name: roleObj.name,
        status: roleObj.status,
        permissions: roleObj.permissions.map((perm) => ({
            module: perm.module,
            moduleLabel: constant_1.MODULE_LABELS[perm.module] || perm.module,
            actions: perm.actions.map((act) => ({
                id: act.id,
                action: act.action,
                actionLabel: constant_1.ACTION_LABELS[act.action] || act.action,
            })),
        })),
        permissionsCount: roleObj.permissions.reduce((acc, perm) => acc + perm.actions.length, 0),
        createdAt: roleObj.createdAt,
        updatedAt: roleObj.updatedAt,
    };
};
