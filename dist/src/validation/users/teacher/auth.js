"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.loginSchema = joi_1.default.object({
    phone: joi_1.default.string().min(10).required().messages({
        'string.empty': 'رقم الهاتف مطلوب',
        'string.min': 'رقم الهاتف غير صحيح',
        'any.required': 'رقم الهاتف مطلوب',
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.empty': 'كلمة المرور مطلوبة',
        'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        'any.required': 'كلمة المرور مطلوبة',
    }),
});
