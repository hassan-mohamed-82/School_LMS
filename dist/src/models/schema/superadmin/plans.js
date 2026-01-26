"use strict";
// src/models/superadmin/SubscriptionPlan.model.ts
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
const featureSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    nameEn: { type: String, required: true },
    included: { type: Boolean, default: true },
}, { _id: false });
const subscriptionPlanSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'اسم الخطة مطلوب'],
        trim: true,
    },
    nameEn: {
        type: String,
        required: [true, 'اسم الخطة بالإنجليزية مطلوب'],
        trim: true,
    },
    description: String,
    descriptionEn: String,
    price: {
        type: Number,
        required: [true, 'السعر مطلوب'],
        min: 0,
    },
    currency: {
        type: String,
        default: 'EGP',
    },
    duration: {
        type: Number,
        required: true,
        default: 365,
    },
    maxStudents: {
        type: Number,
        required: true,
        default: 500,
    },
    maxTeachers: {
        type: Number,
        required: true,
        default: 50,
    },
    maxAdmins: {
        type: Number,
        required: true,
        default: 5,
    },
    features: [featureSchema],
    sortOrder: {
        type: Number,
        default: 0,
    },
    isPopular: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, { timestamps: true });
subscriptionPlanSchema.index({ status: 1, sortOrder: 1 });
exports.default = mongoose_1.default.model('SubscriptionPlan', subscriptionPlanSchema);
