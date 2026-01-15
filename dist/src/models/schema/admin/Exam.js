"use strict";
// src/models/Exam.model.ts
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
const examSchema = new mongoose_1.Schema({
    school: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
    },
    grade: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Grade',
        required: [true, 'المرحلة مطلوبة'],
    },
    subject: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'المادة مطلوبة'],
    },
    name: {
        type: String,
        required: [true, 'اسم الامتحان مطلوب'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['monthly', 'midterm', 'semester', 'final'],
        required: [true, 'نوع الامتحان مطلوب'],
    },
    totalMarks: {
        type: Number,
        required: [true, 'الدرجة الكلية مطلوبة'],
        min: [1, 'الدرجة الكلية يجب أن تكون 1 على الأقل'],
    },
    passingMarks: {
        type: Number,
    },
    date: {
        type: Date,
    },
    academicYear: {
        type: String,
        required: [true, 'العام الدراسي مطلوب'],
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
}, {
    timestamps: true,
});
// Indexes
examSchema.index({ school: 1, grade: 1, subject: 1, type: 1, academicYear: 1 });
examSchema.index({ school: 1, academicYear: 1 });
examSchema.index({ grade: 1, subject: 1 });
exports.default = mongoose_1.default.model('Exam', examSchema);
