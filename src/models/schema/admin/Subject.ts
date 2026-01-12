// src/models/Subject.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface ISubject extends Document {
  school: mongoose.Types.ObjectId;
  name: string;
  nameEn?: string;
  code?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const subjectSchema = new Schema<ISubject>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'اسم المادة مطلوب'],
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
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
subjectSchema.index({ school: 1 });

export default mongoose.model<ISubject>('Subject', subjectSchema);
