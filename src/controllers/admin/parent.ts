import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Parent from '../../models/schema/admin/Parent';
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL PARENTS
// ═══════════════════════════════════════════════════════════════

export const getAllParents = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { status } = req.query;

    // Build query
    const query: any = { school: schoolId };
    if (status) query.status = status;

    const parents = await Parent.find(query)
        .select('-password')
        .sort({ createdAt: -1 });

    return SuccessResponse(res, { parents });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE PARENT
// ═══════════════════════════════════════════════════════════════

export const getOneParent = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const parent = await Parent.findOne({ _id: id, school: schoolId })
        .select('-password');

    if (!parent) {
        throw new NotFound('ولي الأمر غير موجود');
    }

    return SuccessResponse(res, { parent });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE PARENT
// ═══════════════════════════════════════════════════════════════

export const createParent = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { name, phone, password, address, avatar, status } = req.body;

    // Check if phone already exists
    const existingParent = await Parent.findOne({
        school: schoolId,
        phone: phone,
    });

    if (existingParent) {
        throw new BadRequest('رقم الهاتف مسجل مسبقاً');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const parent = await Parent.create({
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

    return SuccessResponse(res, { parent: parentResponse, message: 'تم إضافة ولي الأمر بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PARENT
// ═══════════════════════════════════════════════════════════════

export const updateParent = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, phone, password, address, avatar, status } = req.body;

    // Check if parent exists
    const existingParent = await Parent.findOne({ _id: id, school: schoolId });
    if (!existingParent) {
        throw new NotFound('ولي الأمر غير موجود');
    }

    // Check if phone already exists (if updating phone)
    if (phone && phone !== existingParent.phone) {
        const duplicateParent = await Parent.findOne({
            school: schoolId,
            phone: phone,
            _id: { $ne: id },
        });

        if (duplicateParent) {
            throw new BadRequest('رقم الهاتف مسجل مسبقاً');
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (status !== undefined) updateData.status = status;

    // Handle password change
    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const parent = await Parent.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    ).select('-password');

    return SuccessResponse(res, { parent, message: 'تم تحديث بيانات ولي الأمر بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE PARENT
// ═══════════════════════════════════════════════════════════════

export const removeParent = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const parent = await Parent.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!parent) {
        throw new NotFound('ولي الأمر غير موجود');
    }

    return SuccessResponse(res, { parent, message: 'تم حذف ولي الأمر بنجاح' });
};
