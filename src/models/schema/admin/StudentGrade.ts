// src/models/StudentGrade.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export type RecordedByModel = 'Teacher' | 'SchoolAdmin';

export interface IStudentGrade extends Document {
    school: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    exam: mongoose.Types.ObjectId;
    marks: number;
    recordedBy: mongoose.Types.ObjectId;
    recordedByModel: RecordedByModel;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Schema
const studentGradeSchema = new Schema<IStudentGrade>(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'الطالب مطلوب'],
        },
        exam: {
            type: Schema.Types.ObjectId,
            ref: 'Exam',
            required: [true, 'الامتحان مطلوب'],
        },
        marks: {
            type: Number,
            required: [true, 'الدرجة مطلوبة'],
            min: [0, 'الدرجة لا يمكن أن تكون سالبة'],
        },
        recordedBy: {
            type: Schema.Types.ObjectId,
            required: [true, 'المسجل مطلوب'],
            refPath: 'recordedByModel',
        },
        recordedByModel: {
            type: String,
            enum: ['Teacher', 'SchoolAdmin'],
            required: [true, 'نوع المسجل مطلوب'],
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IStudentGrade>('StudentGrade', studentGradeSchema);
