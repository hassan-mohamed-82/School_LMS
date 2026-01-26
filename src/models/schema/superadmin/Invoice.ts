// src/models/superadmin/Invoice.model.ts

import mongoose, { Document, Schema } from 'mongoose';

export type InvoiceStatus = 'pending' | 'partial' | 'paid' | 'cancelled';

export interface IInvoice extends Document {
    invoiceNumber: string;
    school: mongoose.Types.ObjectId;
    subscription: mongoose.Types.ObjectId;
    amount: number;
    discount: number;
    finalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    dueDate: Date;
    status: InvoiceStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

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
        subscription: {
            type: Schema.Types.ObjectId,
            ref: 'Subscription',
            required: [true, 'الاشتراك مطلوب'],
        },
        amount: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        finalAmount: {
            type: Number,
            required: true,
        },
        paidAmount: {
            type: Number,
            default: 0,
        },
        remainingAmount: {
            type: Number,
            required: true,
        },
        dueDate: {
            type: Date,
            required: [true, 'تاريخ الاستحقاق مطلوب'],
        },
        status: {
            type: String,
            enum: ['pending', 'partial', 'paid', 'cancelled'],
            default: 'pending',
        },
        notes: String,
    },
    { timestamps: true }
);

invoiceSchema.pre('save', async function (next) {
    if (this.isNew && !this.invoiceNumber) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('Invoice').countDocuments();
        this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ school: 1, status: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });

export default mongoose.model<IInvoice>('Invoice', invoiceSchema);
