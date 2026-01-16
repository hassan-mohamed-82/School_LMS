import { Request, Response } from 'express';
import StudentGrade from '../../models/schema/admin/StudentGrade';
import Student from '../../models/schema/admin/Student';
import Exam from '../../models/schema/admin/Exam';
import Grade from '../../models/schema/admin/Grade';
import Class from '../../models/schema/admin/Class';
import Subject from '../../models/schema/admin/Subject';
import { NotFound } from '../../Errors';
import { SuccessResponse } from '../../utils/response';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL STUDENT GRADES
// ═══════════════════════════════════════════════════════════════

export const getAllStudentGrades = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { studentId, examId } = req.query;

    // Build query
    const query: any = { school: schoolId };
    if (studentId) query.student = studentId;
    if (examId) query.exam = examId;

    const studentGrades = await StudentGrade.find(query)
        .populate('student', 'name studentCode')
        .populate({
            path: 'exam',
            select: 'name type totalMarks passingMarks academicYear',
            populate: [
                { path: 'gradeId', select: 'name' },
                { path: 'subject', select: 'name' }
            ]
        })
        .populate('recordedBy', 'name')
        .sort({ createdAt: -1 });

    return SuccessResponse(res, { studentGrades });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ONE STUDENT GRADE
// ═══════════════════════════════════════════════════════════════

export const getOneStudentGrade = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const studentGrade = await StudentGrade.findOne({ _id: id, school: schoolId })
        .populate('student', 'name studentCode')
        .populate({
            path: 'exam',
            select: 'name type totalMarks passingMarks academicYear',
            populate: [
                { path: 'gradeId', select: 'name' },
                { path: 'subject', select: 'name' }
            ]
        })
        .populate('recordedBy', 'name');

    if (!studentGrade) {
        throw new NotFound('درجة الطالب غير موجودة');
    }

    return SuccessResponse(res, { studentGrade });
};

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE STUDENT GRADE
// ═══════════════════════════════════════════════════════════════

export const createStudentGrade = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { studentId, examId, marks, notes } = req.body;

    // Check if grade already exists for this student and exam
    const existingGrade = await StudentGrade.findOne({
        school: schoolId,
        student: studentId,
        exam: examId,
    });

    if (existingGrade) {
        throw new BadRequest('درجة الطالب موجودة مسبقاً لهذا الامتحان');
    }

    // Get exam to validate marks
    const exam = await Exam.findById(examId);
    if (!exam) {
        throw new NotFound('الامتحان غير موجود');
    }

    if (marks > exam.totalMarks) {
        throw new BadRequest(`الدرجة لا يمكن أن تتجاوز ${exam.totalMarks}`);
    }

    // Determine recordedByModel based on user role
    const recordedByModel = userRole === 'teacher' ? 'Teacher' : 'SchoolAdmin';

    const studentGrade = await StudentGrade.create({
        school: schoolId,
        student: studentId,
        exam: examId,
        marks,
        recordedBy: userId,
        recordedByModel,
        notes,
    });

    // Populate for response
    await studentGrade.populate('student', 'name studentCode');
    await studentGrade.populate('exam', 'name type totalMarks');
    await studentGrade.populate('recordedBy', 'name');

    return SuccessResponse(res, { studentGrade, message: 'تم إضافة درجة الطالب بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE STUDENT GRADE
// ═══════════════════════════════════════════════════════════════

export const updateStudentGrade = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;
    const { marks, notes } = req.body;

    // Check if student grade exists
    const existingGrade = await StudentGrade.findOne({ _id: id, school: schoolId });
    if (!existingGrade) {
        throw new NotFound('درجة الطالب غير موجودة');
    }

    // Get exam to validate marks
    if (marks !== undefined) {
        const exam = await Exam.findById(existingGrade.exam);
        if (exam && marks > exam.totalMarks) {
            throw new BadRequest(`الدرجة لا يمكن أن تتجاوز ${exam.totalMarks}`);
        }
    }

    // Prepare update data
    const updateData: any = {};
    if (marks !== undefined) updateData.marks = marks;
    if (notes !== undefined) updateData.notes = notes;

    const studentGrade = await StudentGrade.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
    )
        .populate('student', 'name studentCode')
        .populate('exam', 'name type totalMarks')
        .populate('recordedBy', 'name');

    return SuccessResponse(res, { studentGrade, message: 'تم تحديث درجة الطالب بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE STUDENT GRADE
// ═══════════════════════════════════════════════════════════════

export const removeStudentGrade = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { id } = req.params;

    const studentGrade = await StudentGrade.findOneAndDelete({
        _id: id,
        school: schoolId,
    });

    if (!studentGrade) {
        throw new NotFound('درجة الطالب غير موجودة');
    }

    return SuccessResponse(res, { studentGrade, message: 'تم حذف درجة الطالب بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 📋 SELECT - Get all IDs for dropdown
// ═══════════════════════════════════════════════════════════════

export const select = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;

    const [students, exams, grades, classes, subjects] = await Promise.all([
        Student.find({ school: schoolId, status: 'active' })
            .select('name studentCode gradeId classId')
            .populate('gradeId', 'name')
            .populate('classId', 'name'),
        Exam.find({ school: schoolId, status: 'active' })
            .select('name type totalMarks academicYear gradeId subject')
            .populate('gradeId', 'name')
            .populate('subject', 'name'),
        Grade.find({ school: schoolId, status: 'active' }).select('name nameEn'),
        Class.find({ school: schoolId, status: 'active' }).select('name gradeId').populate('gradeId', 'name'),
        Subject.find({ school: schoolId, status: 'active' }).select('name nameEn'),
    ]);

    return SuccessResponse(res, { students, exams, grades, classes, subjects });
};

// ═══════════════════════════════════════════════════════════════
// 📊 GET GRADES BY STUDENT (Report)
// ═══════════════════════════════════════════════════════════════

export const getByStudent = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { studentId, academicYear } = req.body;

    if (!studentId) {
        throw new BadRequest('الطالب مطلوب');
    }

    const query: any = { school: schoolId, student: studentId };

    const studentGrades = await StudentGrade.find(query)
        .populate({
            path: 'exam',
            select: 'name type totalMarks passingMarks academicYear',
            populate: { path: 'subject', select: 'name' },
            match: academicYear ? { academicYear } : {}
        })
        .sort({ createdAt: -1 });

    // Filter out null exams (from academicYear mismatch)
    const filteredGrades = studentGrades.filter(g => g.exam);

    return SuccessResponse(res, { studentGrades: filteredGrades });
};
