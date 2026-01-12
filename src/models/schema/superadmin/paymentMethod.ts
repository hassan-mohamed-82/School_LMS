// src/models/PaymentMethod.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface IPaymentMethod extends Document {
  name: string;
  nameEn?: string;
  type: 'cash' | 'fawry' | 'bank_transfer' | 'vodafone_cash' | 'instapay';
  accountNumber?: string;
  accountName?: string;
  instructions?: string;
  logo?: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    name: {
      type: String,
      required: [true, 'اسم طريقة الدفع مطلوب'],
      trim: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['cash', 'fawry', 'bank_transfer', 'vodafone_cash', 'instapay'],
      required: [true, 'نوع طريقة الدفع مطلوب'],
    },
    accountNumber: {
      type: String,
    },
    accountName: {
      type: String,
    },
    instructions: {
      type: String,
    },
    logo: {
      type: String,
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
paymentMethodSchema.index({ type: 1 });
paymentMethodSchema.index({ status: 1 });
paymentMethodSchema.index({ sortOrder: 1 });

export default mongoose.model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);
