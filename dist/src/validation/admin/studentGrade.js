"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentGradeSchema = exports.createStudentGradeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createStudentGradeSchema = joi_1.default.object({
    studentId: joi_1.default.string().required().messages({
        'string.empty': 'الطالب مطلوب',
    }),
    examId: joi_1.default.string().required().messages({
        'string.empty': 'الامتحان مطلوب',
    }),
    marks: joi_1.default.number().min(0).required().messages({
        'number.min': 'الدرجة لا يمكن أن تكون سالبة',
        'any.required': 'الدرجة مطلوبة',
    }),
    notes: joi_1.default.string().optional().allow('', null),
});
exports.updateStudentGradeSchema = joi_1.default.object({
    marks: joi_1.default.number().min(0).optional(),
    notes: joi_1.default.string().optional().allow('', null),
});
