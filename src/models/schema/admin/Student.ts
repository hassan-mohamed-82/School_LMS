// src/models/Student.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export type StudentStatus = 'active' | 'inactive'  ;

export interface IStudent extends Document {
    school: mongoose.Types.ObjectId;
    parentId: mongoose.Types.ObjectId;
    gradeId: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
    name: string;
    nameEn?: string;
    nationalId?: string;
    studentCode?: string;
    gender: 'male' | 'female';
    dateOfBirth?: Date;
    address?: string;
    avatar?: string;
    enrollmentDate: Date;
    status: StudentStatus;
    createdAt: Date;
    updatedAt: Date;
}

// Schema
const studentSchema = new Schema<IStudent>(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
        parentId: {
            type: Schema.Types.ObjectId,
            ref: 'Parent',
            required: [true, 'ولي الأمر مطلوب'],
        },
        gradeId: {
            type: Schema.Types.ObjectId,
            ref: 'Grade',
            required: [true, 'المرحلة مطلوبة'],
        },
        classId: {
            type: Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'الفصل مطلوب'],
        },
        name: {
            type: String,
            required: [true, 'اسم الطالب مطلوب'],
            trim: true,
        },
        studentCode: {
            type: String,
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
        },
        dateOfBirth: {
            type: Date,
        },
        address: {
            type: String,
        },
        avatar: {
            type: String,
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


export default mongoose.model<IStudent>('Student', studentSchema);
