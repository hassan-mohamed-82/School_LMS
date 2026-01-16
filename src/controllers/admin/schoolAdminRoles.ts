import { Request, Response } from 'express';
import SchoolAdminRole from '../../models/schema/admin/SchoolAdminRole';
import SchoolAdmin from '../../models/schema/admin/SchoolAdmin';
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import {
    SCHOOL_ADMIN_MODULES,
    MODULE_LABELS,
    ACTION_LABELS,
    getAllModulesWithActions,
    SchoolAdminModuleName,
} from '../../types/constant';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL ROLES
// ═══════════════════════════════════════════════════════════════

export const getAllRoles = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { status } = req.query;

    const query: any = { school: schoolId };
    if (status) query.status = status;

    const roles = await SchoolAdminRole.find(query).sort({ createdAt: -1 });

    const formattedRoles = roles.map(role => formatRoleWithLabels(role));

    return SuccessResponse(res, { roles: formattedRoles });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE ROLE
// ═══════════════════════════════════════════════════════════════

export const getOneRole = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const role = await SchoolAdminRole.findOne({ _id: id, school: schoolId });

    if (!role) {
        throw new NotFound('الدور غير موجود');
    }

    return SuccessResponse(res, { role: formatRoleWithLabels(role) });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE ROLE
// ═══════════════════════════════════════════════════════════════

export const createRole = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { name, permissions, status } = req.body;

    // Check if role name already exists
    const existingRole = await SchoolAdminRole.findOne({
        school: schoolId,
        name: name.trim(),
    });

    if (existingRole) {
        throw new BadRequest('اسم الدور موجود مسبقاً');
    }

    // Validate permissions against available modules
    const validationError = validatePermissions(permissions);
    if (validationError) {
        throw new BadRequest(validationError);
    }

    const role = await SchoolAdminRole.create({
        school: schoolId,
        name: name.trim(),
        permissions,
        status: status || 'active',
    });

    return SuccessResponse(res, {
        role: formatRoleWithLabels(role),
        message: 'تم إضافة الدور بنجاح'
    }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE ROLE
// ═══════════════════════════════════════════════════════════════

export const updateRole = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, permissions, status } = req.body;

    // Check if role exists
    const existingRole = await SchoolAdminRole.findOne({ _id: id, school: schoolId });
    if (!existingRole) {
        throw new NotFound('الدور غير موجود');
    }

    // Check if name already exists (if updating name)
    if (name) {
        const nameExists = await SchoolAdminRole.findOne({
            school: schoolId,
            name: name.trim(),
            _id: { $ne: id },
        });

        if (nameExists) {
            throw new BadRequest('اسم الدور موجود مسبقاً');
        }
    }

    // Validate permissions if provided
    if (permissions) {
        const validationError = validatePermissions(permissions);
        if (validationError) {
            throw new BadRequest(validationError);
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (permissions !== undefined) updateData.permissions = permissions;
    if (status !== undefined) updateData.status = status;

    const role = await SchoolAdminRole.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    );

    return SuccessResponse(res, {
        role: formatRoleWithLabels(role!),
        message: 'تم تحديث الدور بنجاح'
    });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE ROLE
// ═══════════════════════════════════════════════════════════════

export const removeRole = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    // Check if role is assigned to any admin
    const adminsWithRole = await SchoolAdmin.countDocuments({
        school: schoolId,
        role: id,
    });

    if (adminsWithRole > 0) {
        throw new BadRequest(`لا يمكن حذف الدور لأنه مرتبط بـ ${adminsWithRole} مشرف`);
    }

    const role = await SchoolAdminRole.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!role) {
        throw new NotFound('الدور غير موجود');
    }

    return SuccessResponse(res, { message: 'تم حذف الدور بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET AVAILABLE MODULES
// ═══════════════════════════════════════════════════════════════

export const getAvailableModules = async (req: Request, res: Response) => {
    const modules = getAllModulesWithActions();
    return SuccessResponse(res, { modules });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ADMINS BY ROLE
// ═══════════════════════════════════════════════════════════════

export const getAdminsByRole = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    // Check if role exists
    const role = await SchoolAdminRole.findOne({ _id: id, school: schoolId });
    if (!role) {
        throw new NotFound('الدور غير موجود');
    }

    const admins = await SchoolAdmin.find({
        school: schoolId,
        role: id,
    }).select('name email phone status createdAt');

    return SuccessResponse(res, {
        role: {
            _id: role._id,
            name: role.name,
        },
        admins,
        count: admins.length,
    });
};



// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Validate Permissions
// ═══════════════════════════════════════════════════════════════

const validatePermissions = (permissions: any[]): string | null => {
    for (const perm of permissions) {
        // Check if module exists
        if (!SCHOOL_ADMIN_MODULES.hasOwnProperty(perm.module)) {
            return `الموديول "${perm.module}" غير موجود`;
        }

        // Check if actions are valid for this module
        const validActions = SCHOOL_ADMIN_MODULES[perm.module as SchoolAdminModuleName];
        for (const act of perm.actions) {
            if (!validActions.includes(act.action as any)) {
                return `الإجراء "${act.action}" غير متاح للموديول "${perm.module}"`;
            }
        }
    }
    return null;
};

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Format Role with Labels
// ═══════════════════════════════════════════════════════════════

const formatRoleWithLabels = (role: any) => {
    const roleObj = role.toObject ? role.toObject() : role;

    return {
        _id: roleObj._id,
        name: roleObj.name,
        status: roleObj.status,
        permissions: roleObj.permissions.map((perm: any) => ({
            module: perm.module,
            moduleLabel: MODULE_LABELS[perm.module as SchoolAdminModuleName] || perm.module,
            actions: perm.actions.map((act: any) => ({
                id: act.id,
                action: act.action,
                actionLabel: ACTION_LABELS[act.action] || act.action,
            })),
        })),
        permissionsCount: roleObj.permissions.reduce(
            (acc: number, perm: any) => acc + perm.actions.length,
            0
        ),
        createdAt: roleObj.createdAt,
        updatedAt: roleObj.updatedAt,
    };
};
