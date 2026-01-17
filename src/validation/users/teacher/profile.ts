import Joi from "joi";

export const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).optional().messages({
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    email: Joi.string().email().optional().allow('', null).messages({
        'string.email': 'البريد الإلكتروني غير صحيح',
    }),
    gender: Joi.string().valid('male', 'female').optional(),
    dateOfBirth: Joi.string().optional().allow('', null),
    address: Joi.string().optional().allow('', null),
    avatar: Joi.string().optional().allow('', null),
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'string.empty': 'كلمة المرور الحالية مطلوبة',
        'any.required': 'كلمة المرور الحالية مطلوبة',
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.empty': 'كلمة المرور الجديدة مطلوبة',
        'string.min': 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل',
        'any.required': 'كلمة المرور الجديدة مطلوبة',
    }),
});

export const deleteAccountSchema = Joi.object({
    password: Joi.string().required().messages({
        'string.empty': 'كلمة المرور مطلوبة',
        'any.required': 'كلمة المرور مطلوبة',
    }),
});

export const updateFcmTokenSchema = Joi.object({
    fcmToken: Joi.string().required().messages({
        'string.empty': 'FCM Token مطلوب',
        'any.required': 'FCM Token مطلوب',
    }),
});
