"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFcmTokenSchema = exports.deleteAccountSchema = exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updateProfileSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).optional().messages({
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    email: joi_1.default.string().email().optional().allow('', null).messages({
        'string.email': 'البريد الإلكتروني غير صحيح',
    }),
    gender: joi_1.default.string().valid('male', 'female').optional(),
    dateOfBirth: joi_1.default.string().optional().allow('', null),
    address: joi_1.default.string().optional().allow('', null),
    avatar: joi_1.default.string().optional().allow('', null),
});
exports.changePasswordSchema = joi_1.default.object({
    currentPassword: joi_1.default.string().required().messages({
        'string.empty': 'كلمة المرور الحالية مطلوبة',
        'any.required': 'كلمة المرور الحالية مطلوبة',
    }),
    newPassword: joi_1.default.string().min(6).required().messages({
        'string.empty': 'كلمة المرور الجديدة مطلوبة',
        'string.min': 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل',
        'any.required': 'كلمة المرور الجديدة مطلوبة',
    }),
});
exports.deleteAccountSchema = joi_1.default.object({
    password: joi_1.default.string().required().messages({
        'string.empty': 'كلمة المرور مطلوبة',
        'any.required': 'كلمة المرور مطلوبة',
    }),
});
exports.updateFcmTokenSchema = joi_1.default.object({
    fcmToken: joi_1.default.string().required().messages({
        'string.empty': 'FCM Token مطلوب',
        'any.required': 'FCM Token مطلوب',
    }),
});
