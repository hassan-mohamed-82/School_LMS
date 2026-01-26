// src/models/superadmin/Subscription.model.ts

import mongoose, { Document, Schema } from 'mongoose';

export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'suspended' | 'cancelled';

export interface ISubscription extends Document {
    school: mongoose.Types.ObjectId;
    plan: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    price: number;
    discount: number;
    finalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: SubscriptionStatus;
    activatedAt?: Date;
    activatedBy?: mongoose.Types.ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            required: [true, 'المدرسة مطلوبة'],
        },
        plan: {
            type: Schema.Types.ObjectId,
            ref: 'SubscriptionPlan',
            required: [true, 'خطة الاشتراك مطلوبة'],
        },
        startDate: {
            type: Date,
            required: [true, 'تاريخ البداية مطلوب'],
        },
        endDate: {
            type: Date,
            required: [true, 'تاريخ النهاية مطلوب'],
        },
        price: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        finalAmount: {
            type: Number,
            required: true,
        },
        paidAmount: {
            type: Number,
            default: 0,
        },
        remainingAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'expired', 'suspended', 'cancelled'],
            default: 'pending',
        },
        activatedAt: Date,
        activatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'SuperAdmin',
        },
        notes: String,
    },
    { timestamps: true }
);

subscriptionSchema.index({ school: 1, status: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
