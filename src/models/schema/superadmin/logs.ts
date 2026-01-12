// src/models/ActivityLog.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface IActivityLog extends Document {
  admin: mongoose.Types.ObjectId;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'activate' | 'deactivate';
  module: string;
  moduleId?: mongoose.Types.ObjectId;
  description: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Schema
const activityLogSchema = new Schema<IActivityLog>(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'SuperAdmin',
      required: true,
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'login', 'logout', 'activate', 'deactivate'],
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
    },
    description: {
      type: String,
      required: true,
    },
    oldData: {
      type: Schema.Types.Mixed,
    },
    newData: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
activityLogSchema.index({ admin: 1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
