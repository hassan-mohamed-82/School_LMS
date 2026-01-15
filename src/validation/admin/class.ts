import Joi from "joi";

export const createClassSchema = Joi.object({
    gradeId: Joi.string().required().messages({
        'string.empty': 'المرحلة مطلوبة',
    }),
    name: Joi.string().min(1).required().messages({
        'string.empty': 'اسم الفصل مطلوب',
    }),
    capacity: Joi.number().min(1).optional(),
    status: Joi.string().valid('active', 'inactive').optional().default('active'),
});

export const updateClassSchema = Joi.object({
    gradeId: Joi.string().optional(),
    name: Joi.string().min(1).optional(),
    capacity: Joi.number().min(1).optional().allow(null),
    status: Joi.string().valid('active', 'inactive').optional(),
});
