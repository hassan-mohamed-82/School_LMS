import { Request, Response } from 'express';
import Student from '../../models/schema/admin/Student';
import '../../models/schema/admin/Parent'; // Register Parent schema for populate
import '../../models/schema/admin/Grade'; // Register Grade schema for populate
import '../../models/schema/admin/Class'; // Register Class schema for populate
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { BadRequest } from '../../Errors/BadRequest';
import Grade from '../../models/schema/admin/Grade';
import Parent from '../../models/schema/admin/Parent';
import Class from '../../models/schema/admin/Class';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL STUDENTS
// ═══════════════════════════════════════════════════════════════

export const getAllStudents = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, classId, parentId, status } = req.query;

    // Build query
    const query: any = { school: schoolId };
    if (gradeId) query.gradeId = gradeId;
    if (classId) query.classId = classId;
    if (parentId) query.parentId = parentId;
    if (status) query.status = status;

    const students = await Student.find(query)
        .populate('parentId', 'name phone')
        .populate('gradeId', 'name nameEn')
        .populate('classId', 'name')
        .sort({ createdAt: -1 });

    return SuccessResponse(res, { students });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE STUDENT
// ═══════════════════════════════════════════════════════════════

export const getOneStudent = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const student = await Student.findOne({ _id: id, school: schoolId })
        .populate('parentId', 'name phone address')
        .populate('gradeId', 'name nameEn')
        .populate('classId', 'name');

    if (!student) {
        throw new NotFound('الطالب غير موجود');
    }

    return SuccessResponse(res, { student });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE STUDENT
// ═══════════════════════════════════════════════════════════════

export const createStudent = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const {
        parentId,
        gradeId,
        classId,
        name,
        studentCode,
        gender,
        dateOfBirth,
        address,
        avatar,
        status
    } = req.body;

    // Check if studentCode already exists (if provided)
    if (studentCode) {
        const existingStudent = await Student.findOne({
            school: schoolId,
            studentCode: studentCode,
        });

        if (existingStudent) {
            throw new BadRequest('كود الطالب موجود مسبقاً');
        }
    }

    const student = await Student.create({
        school: schoolId,
        parentId,
        gradeId,
        classId,
        name,
        studentCode,
        gender,
        dateOfBirth,
        address,
        avatar,
        status: status || 'active',
    });

    // Populate for response
    await student.populate('parentId', 'name phone');
    await student.populate('gradeId', 'name nameEn');
    await student.populate('classId', 'name');

    return SuccessResponse(res, { student, message: 'تم إضافة الطالب بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE STUDENT
// ═══════════════════════════════════════════════════════════════

export const updateStudent = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const {
        parentId,
        gradeId,
        classId,
        name,
        studentCode,
        gender,
        dateOfBirth,
        address,
        avatar,
        status
    } = req.body;

    // Check if student exists
    const existingStudent = await Student.findOne({ _id: id, school: schoolId });
    if (!existingStudent) {
        throw new NotFound('الطالب غير موجود');
    }

    // Check if studentCode already exists (if updating)
    if (studentCode && studentCode !== existingStudent.studentCode) {
        const duplicateStudent = await Student.findOne({
            school: schoolId,
            studentCode: studentCode,
            _id: { $ne: id },
        });

        if (duplicateStudent) {
            throw new BadRequest('كود الطالب موجود مسبقاً');
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (parentId !== undefined) updateData.parentId = parentId;
    if (gradeId !== undefined) updateData.gradeId = gradeId;
    if (classId !== undefined) updateData.classId = classId;
    if (name !== undefined) updateData.name = name;
    if (studentCode !== undefined) updateData.studentCode = studentCode;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (address !== undefined) updateData.address = address;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (status !== undefined) updateData.status = status;

    const student = await Student.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    )
        .populate('parentId', 'name phone')
        .populate('gradeId', 'name nameEn')
        .populate('classId', 'name');

    return SuccessResponse(res, { student, message: 'تم تحديث بيانات الطالب بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE STUDENT
// ═══════════════════════════════════════════════════════════════

export const removeStudent = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const student = await Student.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!student) {
        throw new NotFound('الطالب غير موجود');
    }

    return SuccessResponse(res, { student, message: 'تم حذف الطالب بنجاح' });
};


export const select = async (req: Request, res: Response) => {
    const grade = await Grade.find({ school: req.user?.schoolId })
    const classes = await Class.find({ school: req.user?.schoolId })
    const parent = await Parent.find({ school: req.user?.schoolId })
    SuccessResponse(res, { grade, classes, parent })

}

// ═══════════════════════════════════════════════════════════════
// 🔍 SEARCH STUDENTS BY PARENT PHONE
// ═══════════════════════════════════════════════════════════════

export const searchByParentPhone = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { phone } = req.query;

    if (!phone) {
        throw new BadRequest('رقم الهاتف مطلوب للبحث');
    }

    // First, find the parent by phone
    const parent = await Parent.findOne({
        school: schoolId,
        phone: { $regex: phone, $options: 'i' }
    });

    if (!parent) {
        return SuccessResponse(res, { students: [], message: 'لا يوجد ولي أمر بهذا الرقم' });
    }

    // Then find students associated with this parent
    const students = await Student.find({
        school: schoolId,
        parentId: parent._id
    })
        .populate('parentId', 'name phone address')
        .populate('gradeId', 'name nameEn')
        .populate('classId', 'name')
        .sort({ createdAt: -1 });

    return SuccessResponse(res, { students, parent: { name: parent.name, phone: parent.phone } });
};
