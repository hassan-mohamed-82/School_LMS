// src/models/SchoolAdminRole.model.ts

import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Available Modules & Actions for School Admin Roles

// Types
export interface IAction {
  id: string;
  action: string;
}

export interface IPermission {
  module: string;
  actions: IAction[];
}

export interface ISchoolAdminRole extends Document {
  school: mongoose.Types.ObjectId;
  name: string;
  permissions: IPermission[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const actionSchema = new Schema<IAction>(
  {
    id: {
      type: String,
      default: () => uuidv4().replace(/-/g, '').substring(0, 24),
    },
    action: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const permissionSchema = new Schema<IPermission>(
  {
    module: {
      type: String,
      required: true,
    },
    actions: [actionSchema],
  },
  { _id: false }
);

const schoolAdminRoleSchema = new Schema<ISchoolAdminRole>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'اسم الدور مطلوب'],
      trim: true,
    },
    permissions: [permissionSchema],
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
schoolAdminRoleSchema.index({ school: 1, name: 1 }, { unique: true });
schoolAdminRoleSchema.index({ school: 1, status: 1 });

export default mongoose.model<ISchoolAdminRole>('SchoolAdminRole', schoolAdminRoleSchema);
