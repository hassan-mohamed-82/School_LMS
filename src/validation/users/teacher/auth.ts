import Joi from "joi";

export const loginSchema = Joi.object({
    phone: Joi.string().min(10).required().messages({
        'string.empty': 'رقم الهاتف مطلوب',
        'string.min': 'رقم الهاتف غير صحيح',
        'any.required': 'رقم الهاتف مطلوب',
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'كلمة المرور مطلوبة',
        'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
        'any.required': 'كلمة المرور مطلوبة',
    }),
});
