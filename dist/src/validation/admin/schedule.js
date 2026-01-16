"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScheduleSchema = exports.createScheduleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createScheduleSchema = joi_1.default.object({
    gradeId: joi_1.default.string().required().messages({
        'string.empty': 'المرحلة مطلوبة',
    }),
    classId: joi_1.default.string().required().messages({
        'string.empty': 'الفصل مطلوب',
    }),
    subjectId: joi_1.default.string().required().messages({
        'string.empty': 'المادة مطلوبة',
    }),
    teacherId: joi_1.default.string().required().messages({
        'string.empty': 'المدرس مطلوب',
    }),
    periodId: joi_1.default.string().required().messages({
        'string.empty': 'الحصة مطلوبة',
    }),
    dayOfWeek: joi_1.default.number().valid(0, 1, 2, 3, 4, 5, 6).required().messages({
        'any.only': 'اليوم غير صحيح',
        'any.required': 'اليوم مطلوب',
    }),
    academicYear: joi_1.default.string().required().messages({
        'string.empty': 'العام الدراسي مطلوب',
    }),
    status: joi_1.default.string().valid('active', 'inactive').optional().default('active'),
});
exports.updateScheduleSchema = joi_1.default.object({
    gradeId: joi_1.default.string().optional(),
    classId: joi_1.default.string().optional(),
    subjectId: joi_1.default.string().optional(),
    teacherId: joi_1.default.string().optional(),
    periodId: joi_1.default.string().optional(),
    dayOfWeek: joi_1.default.number().valid(0, 1, 2, 3, 4, 5, 6).optional(),
    academicYear: joi_1.default.string().optional(),
    status: joi_1.default.string().valid('active', 'inactive').optional(),
});
