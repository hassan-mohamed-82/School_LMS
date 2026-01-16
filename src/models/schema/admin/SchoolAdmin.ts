// src/models/SchoolAdmin.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface ISchoolAdmin extends Document {
  school: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  type: 'organizer' | 'admin';
  role?: mongoose.Types.ObjectId;
  avatar?: string;
  status: 'active' | 'inactive';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const schoolAdminSchema = new Schema<ISchoolAdmin>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
    },
    type: {
      type: String,
      enum: ['organizer', 'admin'],
      default: 'admin',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'SchoolAdminRole',
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

// Indexes
schoolAdminSchema.index({ school: 1 });
schoolAdminSchema.index({ email: 1, school: 1 }, { unique: true });
schoolAdminSchema.index({ status: 1 });

export default mongoose.model<ISchoolAdmin>('SchoolAdmin', schoolAdminSchema);
