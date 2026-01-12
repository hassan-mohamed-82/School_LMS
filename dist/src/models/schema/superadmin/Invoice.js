"use strict";
// src/models/Invoice.model.ts
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
const invoiceSchema = new mongoose_1.Schema({
    invoiceNumber: {
        type: String,
        unique: true,
    },
    school: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'المدرسة مطلوبة'],
    },
    subscriptionPlan: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SuperAdmin',
        required: true,
    },
}, {
    timestamps: true,
});
// Generate invoice number before save
invoiceSchema.pre('save', async function () {
    if (!this.invoiceNumber) {
        const count = await mongoose_1.default.model('Invoice').countDocuments();
        const year = new Date().getFullYear();
        this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, '0')}`;
    }
});
// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ school: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('Invoice', invoiceSchema);
