import { Request, Response } from 'express';
import Subject from '../../models/schema/admin/Subject';
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL SUBJECTS
// ═══════════════════════════════════════════════════════════════

export const getAllSubjects = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { status } = req.query;

    // Build query
    const query: any = { school: schoolId };
    if (status) query.status = status;

    const subjects = await Subject.find(query)
        .sort({ createdAt: -1 });

    return SuccessResponse(res, { subjects });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE SUBJECT
// ═══════════════════════════════════════════════════════════════

export const getOneSubject = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const subject = await Subject.findOne({ _id: id, school: schoolId });

    if (!subject) {
        throw new NotFound('المادة غير موجودة');
    }

    return SuccessResponse(res, { subject });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE SUBJECT
// ═══════════════════════════════════════════════════════════════

export const createSubject = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { name, nameEn, code, status } = req.body;

    // Check if subject name already exists in this school
    const existingSubject = await Subject.findOne({
        school: schoolId,
        name: name,
    });

    if (existingSubject) {
        throw new BadRequest('اسم المادة موجود مسبقاً');
    }

    const subject = await Subject.create({
        school: schoolId,
        name,
        nameEn,
        code,
        status: status || 'active',
    });

    return SuccessResponse(res, { subject, message: 'تم إضافة المادة بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE SUBJECT
// ═══════════════════════════════════════════════════════════════

export const updateSubject = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { name, nameEn, code, status } = req.body;

    // Check if subject exists
    const existingSubject = await Subject.findOne({ _id: id, school: schoolId });
    if (!existingSubject) {
        throw new NotFound('المادة غير موجودة');
    }

    // Check if name already exists (excluding current subject)
    if (name && name !== existingSubject.name) {
        const duplicateSubject = await Subject.findOne({
            school: schoolId,
            name: name,
            _id: { $ne: id },
        });

        if (duplicateSubject) {
            throw new BadRequest('اسم المادة موجود مسبقاً');
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nameEn !== undefined) updateData.nameEn = nameEn;
    if (code !== undefined) updateData.code = code;
    if (status !== undefined) updateData.status = status;

    const subject = await Subject.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    );

    return SuccessResponse(res, { subject, message: 'تم تحديث المادة بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE SUBJECT
// ═══════════════════════════════════════════════════════════════

export const removeSubject = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const subject = await Subject.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!subject) {
        throw new NotFound('المادة غير موجودة');
    }

    return SuccessResponse(res, { subject, message: 'تم حذف المادة بنجاح' });
};
