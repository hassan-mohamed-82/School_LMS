// src/models/superadmin/SubscriptionPlan.model.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IFeature {
    name: string;
    nameEn: string;
    included: boolean;
}

export interface ISubscriptionPlan extends Document {
    name: string;
    nameEn: string;
    description?: string;
    descriptionEn?: string;
    price: number;
    currency: string;
    duration: number;
    maxStudents: number;
    maxTeachers: number;
    maxAdmins: number;
    features: IFeature[];
    sortOrder: number;
    isPopular: boolean;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const featureSchema = new Schema<IFeature>(
    {
        name: { type: String, required: true },
        nameEn: { type: String, required: true },
        included: { type: Boolean, default: true },
    },
    { _id: false }
);

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
    {
        name: {
            type: String,
            required: [true, 'اسم الخطة مطلوب'],
            trim: true,
        },
        nameEn: {
            type: String,
            required: [true, 'اسم الخطة بالإنجليزية مطلوب'],
            trim: true,
        },
        description: String,
        descriptionEn: String,
        price: {
            type: Number,
            required: [true, 'السعر مطلوب'],
            min: 0,
        },
        currency: {
            type: String,
            default: 'EGP',
        },
        duration: {
            type: Number,
            required: true,
            default: 365,
        },
        maxStudents: {
            type: Number,
            required: true,
            default: 500,
        },
        maxTeachers: {
            type: Number,
            required: true,
            default: 50,
        },
        maxAdmins: {
            type: Number,
            required: true,
            default: 5,
        },
        features: [featureSchema],
        sortOrder: {
            type: Number,
            default: 0,
        },
        isPopular: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
);

subscriptionPlanSchema.index({ status: 1, sortOrder: 1 });

export default mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
