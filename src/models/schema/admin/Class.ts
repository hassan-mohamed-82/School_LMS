// src/models/Class.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface IClass extends Document {
  school: mongoose.Types.ObjectId;
  grade: mongoose.Types.ObjectId;
  name: string;
  capacity?: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const classSchema = new Schema<IClass>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    grade: {
      type: Schema.Types.ObjectId,
      ref: 'Grade',
      required: [true, 'المرحلة مطلوبة'],
    },
    name: {
      type: String,
      required: [true, 'اسم الفصل مطلوب'],
      trim: true,
    },
    capacity: {
      type: Number,
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
classSchema.index({ school: 1, grade: 1, name: 1 }, { unique: true });
classSchema.index({ school: 1, status: 1 });
classSchema.index({ grade: 1 });

export default mongoose.model<IClass>('Class', classSchema);
