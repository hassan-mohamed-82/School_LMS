// src/models/Schedule.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface ISchedule extends Document {
  school: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  period: mongoose.Types.ObjectId;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const scheduleSchema = new Schema<ISchedule>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'الفصل مطلوب'],
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'المادة مطلوبة'],
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'المدرس مطلوب'],
    },
    period: {
      type: Schema.Types.ObjectId,
      ref: 'Period',
      required: [true, 'الحصة مطلوبة'],
    },
    dayOfWeek: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6],
      required: [true, 'اليوم مطلوب'],
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
scheduleSchema.index({ school: 1 });
scheduleSchema.index({ school: 1, class: 1, dayOfWeek: 1 });
scheduleSchema.index({ school: 1, teacher: 1, dayOfWeek: 1 });
scheduleSchema.index({ class: 1, period: 1, dayOfWeek: 1 }, { unique: true });

export default mongoose.model<ISchedule>('Schedule', scheduleSchema);
