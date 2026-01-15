import Joi from "joi";

export const createGradeSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.empty': 'اسم المرحلة مطلوب',
        'string.min': 'اسم المرحلة يجب أن يكون حرفين على الأقل',
    }),
    nameEn: Joi.string().optional(),
    sortOrder: Joi.number().optional().default(0),
    status: Joi.string().valid('active', 'inactive').optional().default('active'),
});

export const updateGradeSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    nameEn: Joi.string().optional().allow('', null),
    sortOrder: Joi.number().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
});
