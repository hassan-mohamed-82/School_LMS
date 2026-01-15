import Joi from "joi";

export const createPeriodSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.empty': 'اسم الحصة مطلوب',
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    nameEn: Joi.string().optional(),
    startTime: Joi.string().required().messages({
        'string.empty': 'وقت البداية مطلوب',
    }),
    endTime: Joi.string().required().messages({
        'string.empty': 'وقت النهاية مطلوب',
    }),
    sortOrder: Joi.number().optional().default(0),
    status: Joi.string().valid('active', 'inactive').optional().default('active'),
});

export const updatePeriodSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    nameEn: Joi.string().optional().allow('', null),
    startTime: Joi.string().optional(),
    endTime: Joi.string().optional(),
    sortOrder: Joi.number().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
});
