// src/models/StudentFee.model.ts

import mongoose, { Document, Schema } from 'mongoose';

// Types
export type FeeStatus = 'pending' | 'partial' | 'paid';

export interface IInstallment {
    name: string;
    amount: number;
    dueDate: Date;
    paidAmount: number;
    status: FeeStatus;
}

export interface IStudentFee extends Document {
    school: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    feeCategory: string;
    academicYear: string;
    totalAmount: number;
    discount: number;
    finalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    installments: IInstallment[];
    status: FeeStatus;
    createdAt: Date;
    updatedAt: Date;
}

// Sub-schema for installments
const installmentSchema = new Schema<IInstallment>(
    {
        name: {
            type: String,
            required: [true, 'اسم القسط مطلوب'],
        },
        amount: {
            type: Number,
            required: [true, 'مبلغ القسط مطلوب'],
        },
        dueDate: {
            type: Date,
            required: [true, 'تاريخ الاستحقاق مطلوب'],
        },
        paidAmount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'partial', 'paid'],
            default: 'pending',
        },
    },
    { _id: false }
);

// Schema
const studentFeeSchema = new Schema<IStudentFee>(
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
        feeCategory: {
           type:String,
            required: [true, 'فئة المصاريف مطلوبة'],
        },
        academicYear: {
            type: String,
            required: [true, 'العام الدراسي مطلوب'],
        },
        totalAmount: {
            type: Number,
            required: [true, 'إجمالي المصاريف مطلوب'],
            min: [0, 'إجمالي المصاريف لا يمكن أن يكون سالب'],
        },
        discount: {
            type: Number,
            default: 0,
        },
        finalAmount: {
            type: Number,
            required: [true, 'المبلغ النهائي مطلوب'],
        },
        paidAmount: {
            type: Number,
            default: 0,
        },
        remainingAmount: {
            type: Number,
            required: [true, 'المبلغ المتبقي مطلوب'],
        },
        installments: [installmentSchema],
        status: {
            type: String,
            enum: ['pending', 'partial', 'paid'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IStudentFee>('StudentFee', studentFeeSchema);
