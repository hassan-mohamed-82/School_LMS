import { Request, Response } from 'express';
import Exam from '../../models/schema/admin/Exam';
import Grade from '../../models/schema/admin/Grade';
import Subject from '../../models/schema/admin/Subject';
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL EXAMS
// ═══════════════════════════════════════════════════════════════

export const getAllExams = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, subjectId, type, academicYear, status } = req.query;

    // Build query
    const query: any = { school: schoolId };
    if (gradeId) query.gradeId = gradeId;
    if (subjectId) query.subject = subjectId;
    if (type) query.type = type;
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;

    const exams = await Exam.find(query)
        .populate('gradeId', 'name nameEn')
        .populate('subject', 'name nameEn')
        .sort({ date: -1, createdAt: -1 });

    return SuccessResponse(res, { exams });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE EXAM
// ═══════════════════════════════════════════════════════════════

export const getOneExam = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const exam = await Exam.findOne({ _id: id, school: schoolId })
        .populate('gradeId', 'name nameEn')
        .populate('subject', 'name nameEn');

    if (!exam) {
        throw new NotFound('الامتحان غير موجود');
    }

    return SuccessResponse(res, { exam });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE EXAM
// ═══════════════════════════════════════════════════════════════

export const createExam = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { gradeId, subjectId, name, type, totalMarks, passingMarks, date, academicYear, status } = req.body;

    // Check if exam already exists
    const existingExam = await Exam.findOne({
        school: schoolId,
        gradeId: gradeId,
        subject: subjectId,
        type: type,
        academicYear: academicYear,
        name: name,
    });

    if (existingExam) {
        throw new BadRequest('هذا الامتحان موجود مسبقاً');
    }

    const exam = await Exam.create({
        school: schoolId,
        gradeId,
        subject: subjectId,
        name,
        type,
        totalMarks,
        passingMarks,
        date,
        academicYear,
        status: status || 'active',
    });

    // Populate for response
    await exam.populate('gradeId', 'name nameEn');
    await exam.populate('subject', 'name nameEn');

    return SuccessResponse(res, { exam, message: 'تم إضافة الامتحان بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE EXAM
// ═══════════════════════════════════════════════════════════════

export const updateExam = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { gradeId, subjectId, name, type, totalMarks, passingMarks, date, academicYear, status } = req.body;

    // Check if exam exists
    const existingExam = await Exam.findOne({ _id: id, school: schoolId });
    if (!existingExam) {
        throw new NotFound('الامتحان غير موجود');
    }

    // Prepare update data
    const updateData: any = {};
    if (gradeId !== undefined) updateData.gradeId = gradeId;
    if (subjectId !== undefined) updateData.subject = subjectId;
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
    if (passingMarks !== undefined) updateData.passingMarks = passingMarks;
    if (date !== undefined) updateData.date = date;
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (status !== undefined) updateData.status = status;

    const exam = await Exam.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    )
        .populate('gradeId', 'name nameEn')
        .populate('subject', 'name nameEn');

    return SuccessResponse(res, { exam, message: 'تم تحديث الامتحان بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE EXAM
// ═══════════════════════════════════════════════════════════════

export const removeExam = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const exam = await Exam.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!exam) {
        throw new NotFound('الامتحان غير موجود');
    }

    return SuccessResponse(res, { exam, message: 'تم حذف الامتحان بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 📋 SELECT - Get all IDs for dropdown
// ═══════════════════════════════════════════════════════════════

export const select = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;

    const [grades, subjects] = await Promise.all([
        Grade.find({ school: schoolId, status: 'active' }).select('name nameEn'),
        Subject.find({ school: schoolId, status: 'active' }).select('name nameEn'),
    ]);

    // Exam types list
    const examTypes = [
        { value: 'monthly', label: 'شهري' },
        { value: 'midterm', label: 'نصف الترم' },
        { value: 'semester', label: 'الترم' },
        { value: 'final', label: 'نهائي' },
    ];

    return SuccessResponse(res, { grades, subjects, examTypes });
};
