import Joi from "joi";

export const createStudentSchema = Joi.object({
    parentId: Joi.string().required().messages({
        'string.empty': 'ولي الأمر مطلوب',
    }),
    gradeId: Joi.string().required().messages({
        'string.empty': 'المرحلة مطلوبة',
    }),
    classId: Joi.string().required().messages({
        'string.empty': 'الفصل مطلوب',
    }),
    name: Joi.string().min(2).required().messages({
        'string.empty': 'اسم الطالب مطلوب',
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    studentCode: Joi.string().optional(),
    gender: Joi.string().valid('male', 'female').optional(),
    dateOfBirth: Joi.string().optional(),
    address: Joi.string().optional(),
    avatar: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive').optional().default('active'),
});

export const updateStudentSchema = Joi.object({
    parentId: Joi.string().optional(),
    gradeId: Joi.string().optional(),
    classId: Joi.string().optional(),
    name: Joi.string().min(2).optional(),
    studentCode: Joi.string().optional().allow('', null),
    gender: Joi.string().valid('male', 'female').optional(),
    dateOfBirth: Joi.string().optional().allow('', null),
    address: Joi.string().optional().allow('', null),
    avatar: Joi.string().optional().allow('', null),
    status: Joi.string().valid('active', 'inactive').optional(),
});
