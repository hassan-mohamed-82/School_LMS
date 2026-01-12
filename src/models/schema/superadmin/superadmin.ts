// src/models/SuperAdmin.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  password: string;
  type: 'superadmin' | 'subadmin';
  role?: mongoose.Types.ObjectId;
  avatar?: string;
  status: 'active' | 'inactive';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const superAdminSchema = new Schema<ISuperAdmin>(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: 6,
      select: false,
    },
    type: {
      type: String,
      enum: ['superadmin', 'subadmin'],
      default: 'subadmin',
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'SuperAdminRole',
    },
    avatar: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
superAdminSchema.index({ email: 1 });

export default mongoose.model<ISuperAdmin>('SuperAdmin', superAdminSchema);
