// src/models/Grade.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface IGrade extends Document {
  school: mongoose.Types.ObjectId;
  name: string;
  nameEn?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const gradeSchema = new Schema<IGrade>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'اسم المرحلة مطلوب'],
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
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
gradeSchema.index({ school: 1 });
gradeSchema.index({ school: 1, sortOrder: 1 });

export default mongoose.model<IGrade>('Grade', gradeSchema);
