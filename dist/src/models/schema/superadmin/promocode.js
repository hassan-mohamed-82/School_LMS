"use strict";
// src/models/PromoCode.model.ts
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
const promoCodeSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: [true, 'كود الخصم مطلوب'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: [true, 'نوع الخصم مطلوب'],
    },
    discountValue: {
        type: Number,
        required: [true, 'قيمة الخصم مطلوبة'],
        min: 0,
    },
    maxUses: {
        type: Number,
        min: 1,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    maxUsesPerSchool: {
        type: Number,
        default: 1,
        min: 1,
    },
    minAmount: {
        type: Number,
        min: 0,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    applicablePlans: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'SubscriptionPlan',
        }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active',
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SuperAdmin',
        required: true,
    },
}, {
    timestamps: true,
});
// Indexes
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ status: 1 });
promoCodeSchema.index({ endDate: 1 });
exports.default = mongoose_1.default.model('PromoCode', promoCodeSchema);
