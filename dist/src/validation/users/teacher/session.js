"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadHomeworkSchema = exports.endSessionSchema = exports.recordAttendanceSchema = exports.startSessionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// بدء حصة - scheduleId فقط
exports.startSessionSchema = joi_1.default.object({
    scheduleId: joi_1.default.string().required().messages({
        'any.required': 'معرف الجدول مطلوب',
    }),
});
// تسجيل حضور - بدون sessionId
exports.recordAttendanceSchema = joi_1.default.object({
    attendance: joi_1.default.array()
        .items(joi_1.default.object({
        studentId: joi_1.default.string().required().messages({
            'any.required': 'معرف الطالب مطلوب',
        }),
        status: joi_1.default.string()
            .valid('present', 'absent', 'late', 'excused')
            .required()
            .messages({
            'any.required': 'حالة الحضور مطلوبة',
            'any.only': 'حالة الحضور يجب أن تكون: present, absent, late, excused',
        }),
        notes: joi_1.default.string().optional().allow('', null),
    }))
        .min(1)
        .required()
        .messages({
        'array.min': 'يجب إرسال حضور طالب واحد على الأقل',
        'any.required': 'بيانات الحضور مطلوبة',
    }),
});
// إنهاء حصة - بدون sessionId
exports.endSessionSchema = joi_1.default.object({
    notes: joi_1.default.string().optional().allow('', null),
});
// رفع واجب - بدون IDs
exports.uploadHomeworkSchema = joi_1.default.object({
    title: joi_1.default.string().required().min(3).messages({
        'any.required': 'عنوان الواجب مطلوب',
        'string.min': 'عنوان الواجب يجب أن يكون 3 أحرف على الأقل',
    }),
    description: joi_1.default.string().optional().allow('', null),
    dueDate: joi_1.default.date().optional().allow(null),
    file: joi_1.default.string().optional().allow('', null),
});
