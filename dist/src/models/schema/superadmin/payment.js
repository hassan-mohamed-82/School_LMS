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
    paymentNumber: {
        type: String,
        unique: true,
    },
    school: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'المدرسة مطلوبة'],
    },
    subscription: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: [true, 'الاشتراك مطلوب'],
    },
    invoice: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: [true, 'الفاتورة مطلوبة'],
    },
    paymentMethod: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Generate payment number before save
paymentSchema.pre('save', async function () {
    if (!this.paymentNumber) {
        const count = await mongoose_1.default.model('Payment').countDocuments();
        const year = new Date().getFullYear();
        this.paymentNumber = `PAY-${year}-${String(count + 1).padStart(6, '0')}`;
    }
});
// Indexes
paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ school: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('Payment', paymentSchema);
