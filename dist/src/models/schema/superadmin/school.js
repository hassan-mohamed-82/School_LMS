"use strict";
// src/models/School.model.ts
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
const schoolSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'اسم المدرسة مطلوب'],
        trim: true,
    },
    nameEn: {
        type: String,
        trim: true,
    },
    logo: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'البريد الإلكتروني مطلوب'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'رقم الهاتف مطلوب'],
    },
    whatsapp: {
        type: String,
    },
    website: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    country: {
        type: String,
        default: 'Egypt',
    },
    subscriptionPlan: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
    },
    planStartsAt: {
        type: Date,
    },
    planEndsAt: {
        type: Date,
    },
    maxStudents: {
        type: Number,
        default: 50,
    },
    timezone: {
        type: String,
        default: 'Africa/Cairo',
    },
    currency: {
        type: String,
        default: 'EGP',
    },
    academicYearStart: {
        type: Date,
    },
    academicYearEnd: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active',
    },
}, {
    timestamps: true,
});
// Indexes
schoolSchema.index({ email: 1 });
schoolSchema.index({ status: 1 });
schoolSchema.index({ subscriptionPlan: 1 });
exports.default = mongoose_1.default.model('School', schoolSchema);
