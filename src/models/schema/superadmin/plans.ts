// src/models/SubscriptionPlan.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface ISubscriptionPlan extends Document {
  name: string;
  nameEn?: string;
  price: number;
  yearlyPrice?: number;
  maxStudents: number;
  maxTeachers?: number;
  maxAdmins: number;
  features: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: {
      type: String,
      required: [true, 'اسم الباقة مطلوب'],
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'السعر الشهري مطلوب'],
      min: 0,
    },
    yearlyPrice: {
      type: Number,
      min: 0,
    },
    maxStudents: {
      type: Number,
      required: [true, 'الحد الأقصى للطلاب مطلوب'],
      min: 1,
    },
    maxTeachers: {
      type: Number,
      min: 1,
    },
    maxAdmins: {
      type: Number,
      default: 2,
      min: 1,
    },
    features: [{
      type: String,
    }],
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
subscriptionPlanSchema.index({ status: 1 });

export default mongoose.model<ISubscriptionPlan>('SubscriptionPlan', subscriptionPlanSchema);
