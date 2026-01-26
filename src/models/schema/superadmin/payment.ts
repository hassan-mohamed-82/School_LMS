// src/models/superadmin/SchoolPayment.model.ts

import mongoose, { Document, Schema } from 'mongoose';

export type SchoolPaymentStatus = 'pending' | 'approved' | 'rejected';

export interface ISchoolPayment extends Document {
    paymentNumber: string;
    school: mongoose.Types.ObjectId;
    subscription: mongoose.Types.ObjectId;
    invoice: mongoose.Types.ObjectId;
    paymentMethod: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    transactionId?: string;
    receiptImage: string;
    status: SchoolPaymentStatus;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    rejectionReason?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const schoolPaymentSchema = new Schema<ISchoolPayment>(
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
            min: [1, 'المبلغ يجب أن يكون أكبر من صفر'],
        },
        currency: {
            type: String,
            default: 'EGP',
        },
        transactionId: String,
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
        reviewedAt: Date,
        rejectionReason: String,
        notes: String,
    },
    { timestamps: true }
);

schoolPaymentSchema.pre('save', async function (next) {
    if (this.isNew && !this.paymentNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('SchoolPayment').countDocuments();
        this.paymentNumber = `SPAY-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

schoolPaymentSchema.index({ paymentNumber: 1 });
schoolPaymentSchema.index({ school: 1, status: 1 });
schoolPaymentSchema.index({ status: 1 });
schoolPaymentSchema.index({ createdAt: -1 });

export default mongoose.model<ISchoolPayment>('SchoolPayment', schoolPaymentSchema);
