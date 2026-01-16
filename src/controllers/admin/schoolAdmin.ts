import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import SchoolAdmin from '../../models/schema/admin/SchoolAdmin';
import SchoolAdminRole from '../../models/schema/admin/SchoolAdminRole';
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { saveBase64Image } from '../../utils/handleImages';
import {
    SCHOOL_ADMIN_MODULES,
    MODULE_LABELS,
    ACTION_LABELS,
    getAllModulesWithActions,
    SchoolAdminModuleName,
} from '../../types/constant';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL SCHOOL ADMINS
// ═══════════════════════════════════════════════════════════════

export const getAllSchoolAdmins = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { status, type } = req.query;

    const query: any = { school: schoolId };
    if (status) query.status = status;
    if (type) query.type = type;

    const admins = await SchoolAdmin.find(query)
        .populate({
            path: 'role',
            select: 'name permissions',
        })
        .select('-password')
        .sort({ createdAt: -1 });

    const formattedAdmins = admins.map(admin => formatAdminWithPermissions(admin));

    return SuccessResponse(res, { admins: formattedAdmins });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE SCHOOL ADMIN
// ═══════════════════════════════════════════════════════════════

export const getOneSchoolAdmin = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const admin = await SchoolAdmin.findOne({ _id: id, school: schoolId })
        .populate({
            path: 'role',
            select: 'name permissions',
        })
        .select('-password');

    if (!admin) {
        throw new NotFound('المشرف غير موجود');
    }

    return SuccessResponse(res, { admin: formatAdminWithPermissions(admin) });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE SCHOOL ADMIN
// ═══════════════════════════════════════════════════════════════

export const createSchoolAdmin = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { name, email, password, phone, type, roleId, avatar, status } = req.body;

    // Check if email already exists
   const existingAdmin = await SchoolAdmin.findOne({
        school: schoolId,
        phone: phone,
    });

    if (existingAdmin) {
        throw new BadRequest('رقم الهاتف مسجل مسبقاً');
    }

    // Check if role exists
    const role = await SchoolAdminRole.findOne({ _id: roleId, school: schoolId });
    if (!role) {
        throw new NotFound('الدور غير موجود');
    }

    // Handle avatar
    let avatarUrl = avatar;
    if (avatar && avatar.startsWith('data:image')) {
        const uniqueId = new Date().getTime().toString();
        avatarUrl = await saveBase64Image(avatar, uniqueId, req, 'admins');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await SchoolAdmin.create({
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

    return SuccessResponse(res, {
        admin: formatAdminWithPermissions(admin),
        message: 'تم إضافة المشرف بنجاح'
    }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE SCHOOL ADMIN
// ═══════════════════════════════════════════════════════════════

export const updateSchoolAdmin = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, email, password, phone, type, roleId, avatar, status } = req.body;

    const existingAdmin = await SchoolAdmin.findOne({ _id: id, school: schoolId });
    if (!existingAdmin) {
        throw new NotFound('المشرف غير موجود');
    }

    // Check email uniqueness
    if (email) {
        const emailExists = await SchoolAdmin.findOne({
            school: schoolId,
            email: email.toLowerCase(),
            _id: { $ne: id },
        });

        if (emailExists) {
            throw new BadRequest('البريد الإلكتروني مسجل مسبقاً');
        }
    }

    // Check role exists
    if (roleId) {
        const role = await SchoolAdminRole.findOne({ _id: roleId, school: schoolId });
        if (!role) {
            throw new NotFound('الدور غير موجود');
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (phone !== undefined) updateData.phone = phone;
    if (type !== undefined) updateData.type = type;
    if (roleId !== undefined) updateData.role = roleId;
    if (status !== undefined) updateData.status = status;

    if (avatar) {
        updateData.avatar = avatar.startsWith('data:image')
            ? await saveBase64Image(avatar, existingAdmin._id.toString(), req, 'admins')
            : avatar;
    }

    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const admin = await SchoolAdmin.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    )
        .populate({
            path: 'role',
            select: 'name permissions',
        })
        .select('-password');

    return SuccessResponse(res, {
        admin: formatAdminWithPermissions(admin!),
        message: 'تم تحديث بيانات المشرف بنجاح'
    });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE SCHOOL ADMIN
// ═══════════════════════════════════════════════════════════════

export const removeSchoolAdmin = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const currentUserId = req.user?.id;
    const { id } = req.params;

    if (id === currentUserId) {
        throw new BadRequest('لا يمكنك حذف حسابك الخاص');
    }

    const admin = await SchoolAdmin.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!admin) {
        throw new NotFound('المشرف غير موجود');
    }

    return SuccessResponse(res, { message: 'تم حذف المشرف بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 📋 SELECT - Get roles for dropdown
// ═══════════════════════════════════════════════════════════════

export const select = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;

    const roles = await SchoolAdminRole.find({ school: schoolId, status: 'active' })
        .select('name permissions');

    const adminTypes = [
        { value: 'organizer', label: 'منظم' },
        { value: 'admin', label: 'مشرف' },
    ];

    return SuccessResponse(res, { roles, adminTypes });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ADMIN PERMISSIONS
// ═══════════════════════════════════════════════════════════════

export const getPermissions = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const admin = await SchoolAdmin.findOne({ _id: id, school: schoolId })
        .populate({
            path: 'role',
            select: 'name permissions',
        });

    if (!admin) {
        throw new NotFound('المشرف غير موجود');
    }

    const permissions = (admin.role as any)?.permissions || [];

    return SuccessResponse(res, {
        adminId: admin._id,
        adminName: admin.name,
        roleName: (admin.role as any)?.name || 'بدون دور',
        permissions: formatPermissions(permissions),
    });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL AVAILABLE MODULES (for creating roles)
// ═══════════════════════════════════════════════════════════════

export const getAvailableModules = async (req: Request, res: Response) => {
    const modules = getAllModulesWithActions();
    return SuccessResponse(res, { modules });
};

// ═══════════════════════════════════════════════════════════════
// 🔧 HELPER: Format Admin with Permissions
// ═══════════════════════════════════════════════════════════════

const formatAdminWithPermissions = (admin: any) => {
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

const formatPermissions = (permissions: any[]) => {
    return permissions.map(perm => ({
        module: perm.module,
        moduleLabel: MODULE_LABELS[perm.module as SchoolAdminModuleName] || perm.module,
        actions: perm.actions.map((act: any) => ({
            id: act.id,
            action: act.action,
            actionLabel: ACTION_LABELS[act.action] || act.action,
        })),
    }));
};
