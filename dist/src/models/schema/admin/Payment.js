"use strict";
// src/models/Payment.model.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Schema
const paymentSchema = new mongoose_1.Schema({
    school: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    student: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'الطالب مطلوب'],
    },
    studentFee: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SchoolAdmin',
        required: [true, 'المستلم مطلوب'],
    },
    paidAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Pre-save hook to auto-generate receiptNumber
paymentSchema.pre('save', async function (next) {
    if (this.isNew && !this.receiptNumber) {
        const year = new Date().getFullYear();
        const Payment = mongoose_1.default.model('Payment');
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
exports.default = mongoose_1.default.model('Payment', paymentSchema);
