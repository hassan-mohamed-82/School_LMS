"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentSchema = exports.createStudentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createStudentSchema = joi_1.default.object({
    parentId: joi_1.default.string().required().messages({
        'string.empty': 'ولي الأمر مطلوب',
    }),
    gradeId: joi_1.default.string().required().messages({
        'string.empty': 'المرحلة مطلوبة',
    }),
    classId: joi_1.default.string().required().messages({
        'string.empty': 'الفصل مطلوب',
    }),
    name: joi_1.default.string().min(2).required().messages({
        'string.empty': 'اسم الطالب مطلوب',
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    studentCode: joi_1.default.string().optional(),
    gender: joi_1.default.string().valid('male', 'female').optional(),
    dateOfBirth: joi_1.default.string().optional(),
    address: joi_1.default.string().optional(),
    avatar: joi_1.default.string().optional(),
    status: joi_1.default.string().valid('active', 'inactive').optional().default('active'),
});
exports.updateStudentSchema = joi_1.default.object({
    parentId: joi_1.default.string().optional(),
    gradeId: joi_1.default.string().optional(),
    classId: joi_1.default.string().optional(),
    name: joi_1.default.string().min(2).optional(),
    studentCode: joi_1.default.string().optional().allow('', null),
    gender: joi_1.default.string().valid('male', 'female').optional(),
    dateOfBirth: joi_1.default.string().optional().allow('', null),
    address: joi_1.default.string().optional().allow('', null),
    avatar: joi_1.default.string().optional().allow('', null),
    status: joi_1.default.string().valid('active', 'inactive').optional(),
});
