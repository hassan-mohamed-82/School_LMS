import { Request, Response } from 'express';
import Class from '../../models/schema/admin/Class';
import '../../models/schema/admin/Grade'; // Register Grade schema for populate
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL CLASSES
// ═══════════════════════════════════════════════════════════════

export const getAllClasses = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, status } = req.query;

    // Build query
    const query: any = { school: schoolId };
    if (gradeId) query.gradeId = gradeId;
    if (status) query.status = status;

    const classes = await Class.find(query)
        .populate('gradeId', 'name nameEn')
        .sort({ createdAt: -1 });

    return SuccessResponse(res, { classes });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE CLASS
// ═══════════════════════════════════════════════════════════════

export const getOneClass = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const classDoc = await Class.findOne({ _id: id, school: schoolId })
        .populate('gradeId', 'name nameEn');

    if (!classDoc) {
        throw new NotFound('الفصل غير موجود');
    }

    return SuccessResponse(res, { class: classDoc });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE CLASS
// ═══════════════════════════════════════════════════════════════

export const createClass = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, name, capacity, status } = req.body;

    // Check if class name already exists in this grade
    const existingClass = await Class.findOne({
        school: schoolId,
        gradeId: gradeId,
        name: name,
    });

    if (existingClass) {
        throw new BadRequest('اسم الفصل موجود مسبقاً في هذه المرحلة');
    }

    const classDoc = await Class.create({
        school: schoolId,
        gradeId,
        name,
        capacity,
        status: status || 'active',
    });

    // Populate grade for response
    await classDoc.populate('gradeId', 'name nameEn');

    return SuccessResponse(res, { class: classDoc, message: 'تم إضافة الفصل بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE CLASS
// ═══════════════════════════════════════════════════════════════

export const updateClass = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { gradeId, name, capacity, status } = req.body;

    // Check if class exists
    const existingClass = await Class.findOne({ _id: id, school: schoolId });
    if (!existingClass) {
        throw new NotFound('الفصل غير موجود');
    }

    // Check if name already exists in the same grade (excluding current class)
    if (name || gradeId) {
        const checkGrade = gradeId || existingClass.gradeId;
        const checkName = name || existingClass.name;

        const duplicateClass = await Class.findOne({
            school: schoolId,
            gradeId: checkGrade,
            name: checkName,
            _id: { $ne: id },
        });

        if (duplicateClass) {
            throw new BadRequest('اسم الفصل موجود مسبقاً في هذه المرحلة');
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (gradeId !== undefined) updateData.gradeId = gradeId;
    if (name !== undefined) updateData.name = name;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (status !== undefined) updateData.status = status;

    const classDoc = await Class.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    ).populate('gradeId', 'name nameEn');

    return SuccessResponse(res, { class: classDoc, message: 'تم تحديث الفصل بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE CLASS
// ═══════════════════════════════════════════════════════════════

export const removeClass = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const classDoc = await Class.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!classDoc) {
        throw new NotFound('الفصل غير موجود');
    }

    return SuccessResponse(res, { class: classDoc, message: 'تم حذف الفصل بنجاح' });
};
