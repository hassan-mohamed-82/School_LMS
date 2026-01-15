// src/models/Parent.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export type ParentRelation = 'father' | 'mother' | 'guardian' | 'other';

export interface IParent extends Document {
    school: mongoose.Types.ObjectId;
    name: string;
    phone: string;
    password: string;
    email?: string;
    nationalId?: string;
    relation: ParentRelation;
    job?: string;
    address?: string;
    avatar?: string;
    status: 'active' | 'inactive';
    lastLoginAt?: Date;
    fcmToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Schema
const parentSchema = new Schema<IParent>(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
        name: {
            type: String,
            required: [true, 'اسم ولي الأمر مطلوب'],
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
        fcmToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IParent>('Parent', parentSchema);
