// src/models/Period.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface IPeriod extends Document {
  school: mongoose.Types.ObjectId;
  name: string;
  nameEn?: string;
  startTime: string;
  endTime: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const periodSchema = new Schema<IPeriod>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'اسم الحصة مطلوب'],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, 'وقت البداية مطلوب'],
    },
    endTime: {
      type: String,
      required: [true, 'وقت النهاية مطلوب'],
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


export default mongoose.model<IPeriod>('Period', periodSchema);
