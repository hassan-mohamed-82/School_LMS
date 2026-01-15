// src/models/Payment.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export type PaymentMethod = 'cash' | 'bank_transfer' | 'fawry' | 'vodafone_cash' | 'instapay';

export interface IPayment extends Document {
    school: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    studentFee: mongoose.Types.ObjectId;
    receiptNumber: string;
    amount: number;
    paymentMethod: PaymentMethod;
    installmentIndex?: number;
    receiptImage?: string;
    notes?: string;
    receivedBy: mongoose.Types.ObjectId;
    paidAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Schema
const paymentSchema = new Schema<IPayment>(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: 'School',
            required: true,
        },
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'الطالب مطلوب'],
        },
        studentFee: {
            type: Schema.Types.ObjectId,
            ref: 'StudentFee',
            required: [true, 'سجل المصاريف مطلوب'],
        },
        receiptNumber: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: [true, 'المبلغ مطلوب'],
            min: [0, 'المبلغ لا يمكن أن يكون سالب'],
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'bank_transfer', 'fawry', 'vodafone_cash', 'instapay'],
            default: 'cash',
        },
        installmentIndex: {
            type: Number,
        },
        receiptImage: {
            type: String,
        },
        notes: {
            type: String,
        },
        receivedBy: {
            type: Schema.Types.ObjectId,
            ref: 'SchoolAdmin',
            required: [true, 'المستلم مطلوب'],
        },
        paidAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to auto-generate receiptNumber
paymentSchema.pre('save', async function (next) {
    if (this.isNew && !this.receiptNumber) {
        const year = new Date().getFullYear();
        const Payment = mongoose.model<IPayment>('Payment');

        // Find the last receipt number for this school in this year
        const lastPayment = await Payment.findOne({
            school: this.school,
            receiptNumber: new RegExp(`^RCP-${year}-`),
        }).sort({ receiptNumber: -1 });

        let nextNumber = 1;
        if (lastPayment && lastPayment.receiptNumber) {
            const lastNumber = parseInt(lastPayment.receiptNumber.split('-')[2], 10);
            nextNumber = lastNumber + 1;
        }

        this.receiptNumber = `RCP-${year}-${String(nextNumber).padStart(6, '0')}`;
    }
    next();
});

// Indexes
paymentSchema.index({ school: 1, receiptNumber: 1 }, { unique: true });
paymentSchema.index({ school: 1, student: 1 });
paymentSchema.index({ school: 1, studentFee: 1 });
paymentSchema.index({ student: 1 });
paymentSchema.index({ paidAt: -1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
