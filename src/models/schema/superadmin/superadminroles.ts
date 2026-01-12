// src/models/SuperAdminRole.model.ts

import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface IAction {
  id: string;
  action: string;
}

export interface IPermission {
  module: string;
  actions: IAction[];
}

export interface ISuperAdminRole extends Document {
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

const superAdminRoleSchema = new Schema<ISuperAdminRole>(
  {
    name: {
      type: String,
      required: [true, 'اسم الدور مطلوب'],
      unique: true,
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
superAdminRoleSchema.index({ name: 1 });
superAdminRoleSchema.index({ status: 1 });

export default mongoose.model<ISuperAdminRole>('SuperAdminRole', superAdminRoleSchema);