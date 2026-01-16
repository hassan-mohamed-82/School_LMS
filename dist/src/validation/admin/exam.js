"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExamSchema = exports.createExamSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createExamSchema = joi_1.default.object({
    gradeId: joi_1.default.string().required().messages({
        'string.empty': 'المرحلة مطلوبة',
    }),
    subjectId: joi_1.default.string().required().messages({
        'string.empty': 'المادة مطلوبة',
    }),
    name: joi_1.default.string().min(2).required().messages({
        'string.empty': 'اسم الامتحان مطلوب',
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    type: joi_1.default.string().valid('monthly', 'midterm', 'semester', 'final').required().messages({
        'any.only': 'نوع الامتحان غير صحيح',
        'any.required': 'نوع الامتحان مطلوب',
    }),
    totalMarks: joi_1.default.number().min(1).required().messages({
        'number.min': 'الدرجة الكلية يجب أن تكون 1 على الأقل',
        'any.required': 'الدرجة الكلية مطلوبة',
    }),
    passingMarks: joi_1.default.number().min(0).optional(),
    date: joi_1.default.string().optional(),
    academicYear: joi_1.default.string().required().messages({
        'string.empty': 'العام الدراسي مطلوب',
    }),
    status: joi_1.default.string().valid('active', 'inactive').optional().default('active'),
});
exports.updateExamSchema = joi_1.default.object({
    gradeId: joi_1.default.string().optional(),
    subjectId: joi_1.default.string().optional(),
    name: joi_1.default.string().min(2).optional(),
    type: joi_1.default.string().valid('monthly', 'midterm', 'semester', 'final').optional(),
    totalMarks: joi_1.default.number().min(1).optional(),
    passingMarks: joi_1.default.number().min(0).optional().allow(null),
    date: joi_1.default.string().optional().allow('', null),
    academicYear: joi_1.default.string().optional(),
    status: joi_1.default.string().valid('active', 'inactive').optional(),
});
