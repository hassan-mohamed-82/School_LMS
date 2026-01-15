// src/models/Teacher.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface ITeacher extends Document {
    school: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    password: string;
    email?: string;
    nationalId?: string;
    gender?: 'male' | 'female';
    dateOfBirth?: Date;
    address?: string;
    avatar?: string;
    subjects: mongoose.Types.ObjectId[];
    status: 'active' | 'inactive';
    lastLoginAt?: Date;
    fcmToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Schema
const teacherSchema = new Schema<ITeacher>(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            // required: true,
        },
        name: {
            type: String,
            required: [true, 'الاسم مطلوب'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'رقم الهاتف مطلوب'],
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'كلمة المرور مطلوبة'],
            select: false,
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
        subjects: [{
            type: Schema.Types.ObjectId,
            ref: 'Subject',
        }],
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        fcmToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);


export default mongoose.model<ITeacher>('Teacher', teacherSchema);
