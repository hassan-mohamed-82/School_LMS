import Joi from "joi";

export const createSubjectSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.empty': 'اسم المادة مطلوب',
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    nameEn: Joi.string().optional(),
    code: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive').optional().default('active'),
});

export const updateSubjectSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    nameEn: Joi.string().optional().allow('', null),
    code: Joi.string().optional().allow('', null),
    status: Joi.string().valid('active', 'inactive').optional(),
});
