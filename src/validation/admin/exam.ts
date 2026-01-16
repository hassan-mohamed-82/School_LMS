import Joi from "joi";

export const createExamSchema = Joi.object({
    gradeId: Joi.string().required().messages({
        'string.empty': 'المرحلة مطلوبة',
    }),
    subjectId: Joi.string().required().messages({
        'string.empty': 'المادة مطلوبة',
    }),
    name: Joi.string().min(2).required().messages({
        'string.empty': 'اسم الامتحان مطلوب',
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    type: Joi.string().valid('monthly', 'midterm', 'semester', 'final').required().messages({
        'any.only': 'نوع الامتحان غير صحيح',
        'any.required': 'نوع الامتحان مطلوب',
    }),
    totalMarks: Joi.number().min(1).required().messages({
        'number.min': 'الدرجة الكلية يجب أن تكون 1 على الأقل',
        'any.required': 'الدرجة الكلية مطلوبة',
    }),
    passingMarks: Joi.number().min(0).optional(),
    date: Joi.string().optional(),
    academicYear: Joi.string().required().messages({
        'string.empty': 'العام الدراسي مطلوب',
    }),
    status: Joi.string().valid('active', 'inactive').optional().default('active'),
});

export const updateExamSchema = Joi.object({
    gradeId: Joi.string().optional(),
    subjectId: Joi.string().optional(),
    name: Joi.string().min(2).optional(),
    type: Joi.string().valid('monthly', 'midterm', 'semester', 'final').optional(),
    totalMarks: Joi.number().min(1).optional(),
    passingMarks: Joi.number().min(0).optional().allow(null),
    date: Joi.string().optional().allow('', null),
    academicYear: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
});
