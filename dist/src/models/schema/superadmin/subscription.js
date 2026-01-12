"use strict";
// src/models/Subscription.model.ts
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
const subscriptionSchema = new mongoose_1.Schema({
    school: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, 'المدرسة مطلوبة'],
    },
    plan: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: [true, 'الباقة مطلوبة'],
    },
    startDate: {
        type: Date,
        required: [true, 'تاريخ البداية مطلوب'],
    },
    endDate: {
        type: Date,
        required: [true, 'تاريخ النهاية مطلوب'],
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'EGP',
    },
    promoCode: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'PromoCode',
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'pending'],
        default: 'pending',
    },
    autoRenew: {
        type: Boolean,
        default: false,
    },
    renewalReminders: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SuperAdmin',
        required: true,
    },
    cancelledAt: {
        type: Date,
    },
    cancelledBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SuperAdmin',
    },
    cancelReason: {
        type: String,
    },
}, {
    timestamps: true,
});
// Indexes
subscriptionSchema.index({ school: 1 });
subscriptionSchema.index({ plan: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ school: 1, status: 1 });
exports.default = mongoose_1.default.model('Subscription', subscriptionSchema);
