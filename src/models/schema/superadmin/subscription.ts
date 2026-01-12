// src/models/Subscription.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface ISubscription extends Document {
  school: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  amount: number;
  discount: number;
  totalAmount: number;
  currency: string;
  promoCode?: mongoose.Types.ObjectId;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenew: boolean;
  renewalReminders: boolean;
  createdBy: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const subscriptionSchema = new Schema<ISubscription>(
  {
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'المدرسة مطلوبة'],
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: [true, 'الباقة مطلوبة'],
    },
    startDate: {
      type: Date,
      required: [true, 'تاريخ البداية مطلوب'],
    },
    endDate: {
      type: Date,
      required: [true, 'تاريخ النهاية مطلوب'],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'EGP',
    },
    promoCode: {
      type: Schema.Types.ObjectId,
      ref: 'PromoCode',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'pending'],
      default: 'pending',
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    renewalReminders: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'SuperAdmin',
      required: true,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'SuperAdmin',
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
subscriptionSchema.index({ school: 1 });
subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ school: 1, status: 1 });

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
