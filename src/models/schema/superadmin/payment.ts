// src/models/Payment.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export interface IPayment extends Document {
  paymentNumber: string;
  school: mongoose.Types.ObjectId;
  subscription: mongoose.Types.ObjectId;
  invoice: mongoose.Types.ObjectId;
  paymentMethod: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  receiptImage: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const paymentSchema = new Schema<IPayment>(
  {
    paymentNumber: {
      type: String,
      unique: true,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'المدرسة مطلوبة'],
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: [true, 'الاشتراك مطلوب'],
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      required: [true, 'الفاتورة مطلوبة'],
    },
    paymentMethod: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentMethod',
      required: [true, 'طريقة الدفع مطلوبة'],
    },
    amount: {
      type: Number,
      required: [true, 'المبلغ مطلوب'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'EGP',
    },
    receiptImage: {
      type: String,
      required: [true, 'صورة إيصال الدفع مطلوبة'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'SuperAdmin',
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate payment number before save
paymentSchema.pre('save', async function () {
  if (!this.paymentNumber) {
    const count = await mongoose.model('Payment').countDocuments();
    const year = new Date().getFullYear();
    this.paymentNumber = `PAY-${year}-${String(count + 1).padStart(6, '0')}`;
  }
});

// Indexes
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ school: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
