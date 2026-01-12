// src/models/PromoCode.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface IPromoCode extends Document {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  maxUsesPerSchool: number;
  minAmount?: number;
  startDate?: Date;
  endDate?: Date;
  applicablePlans?: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive' | 'expired';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const promoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: [true, 'كود الخصم مطلوب'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'نوع الخصم مطلوب'],
    },
    discountValue: {
      type: Number,
      required: [true, 'قيمة الخصم مطلوبة'],
      min: 0,
    },
    maxUses: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    maxUsesPerSchool: {
      type: Number,
      default: 1,
      min: 1,
    },
    minAmount: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    applicablePlans: [{
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'SuperAdmin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ status: 1 });
promoCodeSchema.index({ endDate: 1 });

export default mongoose.model<IPromoCode>('PromoCode', promoCodeSchema);
