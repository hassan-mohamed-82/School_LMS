import { Request, Response } from 'express';
import Period from '../../models/schema/admin/Period';
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL PERIODS
// ═══════════════════════════════════════════════════════════════

export const getAllPeriods = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { status } = req.query;

    // Build query
    const query: any = { school: schoolId };
    if (status) query.status = status;

    const periods = await Period.find(query)
        .sort({ sortOrder: 1, startTime: 1 });

    return SuccessResponse(res, { periods });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE PERIOD
// ═══════════════════════════════════════════════════════════════

export const getOnePeriod = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const period = await Period.findOne({ _id: id, school: schoolId });

    if (!period) {
        throw new NotFound('الحصة غير موجودة');
    }

    return SuccessResponse(res, { period });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE PERIOD
// ═══════════════════════════════════════════════════════════════

export const createPeriod = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { name, nameEn, startTime, endTime, sortOrder, status } = req.body;

    // Check if period name already exists in this school
    const existingPeriod = await Period.findOne({
        school: schoolId,
        name: name,
    });

    if (existingPeriod) {
        throw new BadRequest('اسم الحصة موجود مسبقاً');
    }

    const period = await Period.create({
        school: schoolId,
        name,
        nameEn,
        startTime,
        endTime,
        sortOrder: sortOrder || 0,
        status: status || 'active',
    });

    return SuccessResponse(res, { period, message: 'تم إضافة الحصة بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PERIOD
// ═══════════════════════════════════════════════════════════════

export const updatePeriod = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, nameEn, startTime, endTime, sortOrder, status } = req.body;

    // Check if period exists
    const existingPeriod = await Period.findOne({ _id: id, school: schoolId });
    if (!existingPeriod) {
        throw new NotFound('الحصة غير موجودة');
    }

    // Check if name already exists (excluding current period)
    if (name && name !== existingPeriod.name) {
        const duplicatePeriod = await Period.findOne({
            school: schoolId,
            name: name,
            _id: { $ne: id },
        });

        if (duplicatePeriod) {
            throw new BadRequest('اسم الحصة موجود مسبقاً');
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (status !== undefined) updateData.status = status;

    const period = await Period.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    );

    return SuccessResponse(res, { period, message: 'تم تحديث الحصة بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE PERIOD
// ═══════════════════════════════════════════════════════════════

export const removePeriod = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const period = await Period.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!period) {
        throw new NotFound('الحصة غير موجودة');
    }

    return SuccessResponse(res, { period, message: 'تم حذف الحصة بنجاح' });
};
