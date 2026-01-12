// src/models/Invoice.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface IInvoice extends Document {
  invoiceNumber: string;
  school: mongoose.Types.ObjectId;
  subscriptionPlan: mongoose.Types.ObjectId;
  amount: number;
  discount: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentMethod?: 'cash' | 'online' | 'bank_transfer' | 'check';
  transactionId?: string;
  periodStart: Date;
  periodEnd: Date;
  paidAt?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'المدرسة مطلوبة'],
    },
    subscriptionPlan: {
      type: Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: [true, 'الباقة مطلوبة'],
    },
    amount: {
      type: Number,
      required: [true, 'المبلغ مطلوب'],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'المبلغ الإجمالي مطلوب'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'EGP',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'bank_transfer', 'check'],
    },
    transactionId: {
      type: String,
    },
    periodStart: {
      type: Date,
      required: [true, 'تاريخ بداية الفترة مطلوب'],
    },
    periodEnd: {
      type: Date,
      required: [true, 'تاريخ نهاية الفترة مطلوب'],
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
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

// Generate invoice number before save
invoiceSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    const year = new Date().getFullYear();
    this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
  }
});

// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ school: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);
