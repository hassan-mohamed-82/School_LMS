import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Teacher from '../../models/schema/admin/Teacher';
import '../../models/schema/admin/Subject'; // Import to register schema for populate
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { saveBase64Image } from '../../utils/handleImages';
import { BadRequest } from '../../Errors/BadRequest';
import Subject from '../../models/schema/admin/Subject';

// GET /teachers - Get all teachers
export const getAllTeacher = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;

    const teachers = await Teacher.find({ school: schoolId })
        .populate('subjects', 'name nameEn')
        .select('-password')
        .sort({ createdAt: -1 });

    return SuccessResponse(res, { teachers });
};

// GET /teachers/:id - Get single teacher
export const getOneTeacher = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const teacher = await Teacher.findOne({ _id: id, school: schoolId })
        .populate('subjects', 'name nameEn')
        .select('-password');

    if (!teacher) {
        throw new NotFound('المدرس غير موجود');
    }

    return SuccessResponse(res, { teacher });
};

// POST /teachers - Create teacher
export const createTeacher = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const data = req.body;

    // Check if phone already exists
    const existingTeacher = await Teacher.findOne({
        school: schoolId,
        phone: data.phone,
    });

    if (existingTeacher) {
        throw new BadRequest('رقم الهاتف مسجل مسبقاً');
    }

    // ✅ Check if subjects exist
    if (data.subjects && data.subjects.length > 0) {
        const existingSubjects = await Subject.find({
            _id: { $in: data.subjects },
            school: schoolId,
            status: 'active',
        });

        // Check if all subjects found
        if (existingSubjects.length !== data.subjects.length) {
            // Find which subjects are missing
            const foundIds = existingSubjects.map(s => s._id.toString());
            const missingIds = data.subjects.filter((id: string) => !foundIds.includes(id));
            
            throw new BadRequest(`بعض المواد غير موجودة: ${missingIds.join(', ')}`);
        }
    }

    // Handle avatar image
    if (data.avatar) {
        data.avatar = await saveBase64Image(data.avatar, data.phone, req, 'teachers');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const teacher = await Teacher.create({
        ...data,
        school: schoolId,
        password: hashedPassword,
    });

    // Populate subjects for response
    await teacher.populate('subjects', 'name nameEn');

    // Remove password from response
    const { password: _, ...teacherResponse } = teacher.toObject();

    SuccessResponse(res, { teacher: teacherResponse, message: 'تم إضافة المدرس بنجاح' }, 201);
};

// PUT /teachers/:id - Update teacher (includes status & password)
export const updateTeacher = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const data = req.body;

    // Check if teacher exists
    const existingTeacher = await Teacher.findOne({
        _id: id,
        school: schoolId,
    });

    if (!existingTeacher) {
        throw new NotFound('المدرس غير موجود');
    }

    // Check if phone already used by another teacher
    if (data.phone && data.phone !== existingTeacher.phone) {
        const phoneExists = await Teacher.findOne({
            school: schoolId,
            phone: data.phone,
            _id: { $ne: id },
        });

        if (phoneExists) {
            throw new BadRequest('رقم الهاتف مسجل مسبقاً');
        }
    }

    // ✅ Check if subjects exist
    if (data.subjects && data.subjects.length > 0) {
        const existingSubjects = await Subject.find({
            _id: { $in: data.subjects },
            school: schoolId,
            status: 'active',
        });

        if (existingSubjects.length !== data.subjects.length) {
            const foundIds = existingSubjects.map(s => s._id.toString());
            const missingIds = data.subjects.filter((id: string) => !foundIds.includes(id));
            
            throw new BadRequest(`بعض المواد غير موجودة: ${missingIds.join(', ')}`);
        }
    }

    // Handle avatar
    if (data.avatar && data.avatar.startsWith('data:image')) {
        data.avatar = await saveBase64Image(data.avatar, data.phone || existingTeacher.phone, req, 'teachers');
    }

    // Hash password if provided
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    const teacher = await Teacher.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
    )
        .populate('subjects', 'name nameEn')
        .select('-password');

    SuccessResponse(res, { teacher, message: 'تم تحديث بيانات المدرس بنجاح' });
};

// DELETE /teachers/:id - Delete teacher
export const removeTeacher = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const teacher = await Teacher.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!teacher) {
        throw new NotFound('المدرس غير موجود');
    }

    SuccessResponse(res, { teacher, message: 'تم حذف المدرس بنجاح' });
};


export const select =async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const subjects = await Subject.find({ school: schoolId ,status:'active'});
    return SuccessResponse(res, { subjects });
};