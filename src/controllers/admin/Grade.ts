import { Request, Response } from 'express';
import Grade from '../../models/schema/admin/Grade';
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL GRADES
// ═══════════════════════════════════════════════════════════════

export const getAllGrades = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;

    const grades = await Grade.find({ school: schoolId })
        .sort({ sortOrder: 1, createdAt: -1 });

    return SuccessResponse(res, { grades });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE GRADE
// ═══════════════════════════════════════════════════════════════

export const getOneGrade = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const grade = await Grade.findOne({ _id: id, school: schoolId });

    if (!grade) {
        throw new NotFound('المرحلة غير موجودة');
    }

    return SuccessResponse(res, { grade });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE GRADE
// ═══════════════════════════════════════════════════════════════

export const createGrade = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { name, nameEn, sortOrder, status } = req.body;

    // Check if grade name already exists in this school
    const existingGrade = await Grade.findOne({
        school: schoolId,
        name: name,
    });

    if (existingGrade) {
        throw new BadRequest('اسم المرحلة موجود مسبقاً');
    }

    const grade = await Grade.create({
        school: schoolId,
        name,
        nameEn,
        sortOrder: sortOrder || 0,
        status: status || 'active',
    });

    return SuccessResponse(res, { grade, message: 'تم إضافة المرحلة بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE GRADE
// ═══════════════════════════════════════════════════════════════

export const updateGrade = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, nameEn, sortOrder, status } = req.body;

    // Check if grade exists
    const existingGrade = await Grade.findOne({ _id: id, school: schoolId });
    if (!existingGrade) {
        throw new NotFound('المرحلة غير موجودة');
    }

    // Check if name already exists (excluding current grade)
    if (name && name !== existingGrade.name) {
        const duplicateGrade = await Grade.findOne({
            school: schoolId,
            name: name,
            _id: { $ne: id },
        });

        if (duplicateGrade) {
            throw new BadRequest('اسم المرحلة موجود مسبقاً');
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (status !== undefined) updateData.status = status;

    const grade = await Grade.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    );

    return SuccessResponse(res, { grade, message: 'تم تحديث المرحلة بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE GRADE
// ═══════════════════════════════════════════════════════════════

export const removeGrade = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const grade = await Grade.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!grade) {
        throw new NotFound('المرحلة غير موجودة');
    }

    return SuccessResponse(res, { grade, message: 'تم حذف المرحلة بنجاح' });
};
