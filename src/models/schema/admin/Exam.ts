// src/models/Exam.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export type ExamType = 'monthly' | 'midterm' | 'semester' | 'final';

export interface IExam extends Document {
    school: mongoose.Types.ObjectId;
    gradeId: mongoose.Types.ObjectId;
    subject: mongoose.Types.ObjectId;
    name: string;
    type: ExamType;
    totalMarks: number;
    passingMarks?: number;
    date?: Date;
    academicYear: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

// Schema
const examSchema = new Schema<IExam>(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
        gradeId: {
            type: Schema.Types.ObjectId,
            ref: 'Grade',
            required: [true, 'المرحلة مطلوبة'],
        },
        subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            required: [true, 'المادة مطلوبة'],
        },
        name: {
            type: String,
            required: [true, 'اسم الامتحان مطلوب'],
            trim: true,
        },
        type: {
            type: String,
            enum: ['monthly', 'midterm', 'semester', 'final'],
            required: [true, 'نوع الامتحان مطلوب'],
        },
        totalMarks: {
            type: Number,
            required: [true, 'الدرجة الكلية مطلوبة'],
            min: [1, 'الدرجة الكلية يجب أن تكون 1 على الأقل'],
        },
        passingMarks: {
            type: Number,
        },
        date: {
            type: Date,
        },
        academicYear: {
            type: String,
            required: [true, 'العام الدراسي مطلوب'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
examSchema.index({ school: 1, grade: 1, subject: 1, type: 1, academicYear: 1 });
examSchema.index({ school: 1, academicYear: 1 });
examSchema.index({ grade: 1, subject: 1 });

export default mongoose.model<IExam>('Exam', examSchema);
