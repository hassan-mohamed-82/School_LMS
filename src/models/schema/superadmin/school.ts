// src/models/School.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface ISchool extends Document {
  name: string;
  nameEn?: string;
  logo?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  address?: string;
  city?: string;
  country: string;
  subscriptionPlan?: mongoose.Types.ObjectId;
  planStartsAt?: Date;
  planEndsAt?: Date;
  maxStudents: number;
  timezone: string;
  currency: string;
  academicYearStart?: Date;
  academicYearEnd?: Date;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const schoolSchema = new Schema<ISchool>(
  {
    name: {
      type: String,
      required: [true, 'اسم المدرسة مطلوب'],
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'رقم الهاتف مطلوب'],
    },
    whatsapp: {
      type: String,
    },
    website: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
      default: 'Egypt',
    },
    subscriptionPlan: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
    },
    planStartsAt: {
      type: Date,
    },
    planEndsAt: {
      type: Date,
    },
    maxStudents: {
      type: Number,
      default: 50,
    },
    timezone: {
      type: String,
      default: 'Africa/Cairo',
    },
    currency: {
      type: String,
      default: 'EGP',
    },
    academicYearStart: {
      type: Date,
    },
    academicYearEnd: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
schoolSchema.index({ email: 1 });
schoolSchema.index({ status: 1 });
schoolSchema.index({ subscriptionPlan: 1 });

export default mongoose.model<ISchool>('School', schoolSchema);
