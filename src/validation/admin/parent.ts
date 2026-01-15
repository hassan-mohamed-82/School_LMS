import Joi from "joi";

export const createParentSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.empty': 'اسم ولي الأمر مطلوب',
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    phone: Joi.string().min(10).required().messages({
        'string.empty': 'رقم الهاتف مطلوب',
        'string.min': 'رقم الهاتف غير صحيح',
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'كلمة المرور مطلوبة',
        'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    }),
    address: Joi.string().optional(),
    avatar: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive').optional().default('active'),
});

export const updateParentSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    phone: Joi.string().min(10).optional(),
    password: Joi.string().min(6).optional(),
    address: Joi.string().optional().allow('', null),
    avatar: Joi.string().optional().allow('', null),
    status: Joi.string().valid('active', 'inactive').optional(),
});
