import Joi from "joi";

export const createScheduleSchema = Joi.object({
    gradeId: Joi.string().required().messages({
        'string.empty': 'المرحلة مطلوبة',
    }),
    classId: Joi.string().required().messages({
        'string.empty': 'الفصل مطلوب',
    }),
    subjectId: Joi.string().required().messages({
        'string.empty': 'المادة مطلوبة',
    }),
    teacherId: Joi.string().required().messages({
        'string.empty': 'المدرس مطلوب',
    }),
    periodId: Joi.string().required().messages({
        'string.empty': 'الحصة مطلوبة',
    }),
    dayOfWeek: Joi.number().valid(0, 1, 2, 3, 4, 5, 6).required().messages({
        'any.only': 'اليوم غير صحيح',
        'any.required': 'اليوم مطلوب',
    }),
    academicYear: Joi.string().required().messages({
        'string.empty': 'العام الدراسي مطلوب',
    }),
    status: Joi.string().valid('active', 'inactive').optional().default('active'),
});

export const updateScheduleSchema = Joi.object({
    gradeId: Joi.string().optional(),
    classId: Joi.string().optional(),
    subjectId: Joi.string().optional(),
    teacherId: Joi.string().optional(),
    periodId: Joi.string().optional(),
    dayOfWeek: Joi.number().valid(0, 1, 2, 3, 4, 5, 6).optional(),
    academicYear: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
});
