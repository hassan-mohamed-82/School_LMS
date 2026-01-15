"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubjectSchema = exports.createSubjectSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createSubjectSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required().messages({
        'string.empty': 'اسم المادة مطلوب',
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    nameEn: joi_1.default.string().optional(),
    code: joi_1.default.string().optional(),
    status: joi_1.default.string().valid('active', 'inactive').optional().default('active'),
});
exports.updateSubjectSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).optional(),
    nameEn: joi_1.default.string().optional().allow('', null),
    code: joi_1.default.string().optional().allow('', null),
    status: joi_1.default.string().valid('active', 'inactive').optional(),
});
