import Joi from "joi";

export const createStudentGradeSchema = Joi.object({
    studentId: Joi.string().required().messages({
        'string.empty': 'الطالب مطلوب',
    }),
    examId: Joi.string().required().messages({
        'string.empty': 'الامتحان مطلوب',
    }),
    marks: Joi.number().min(0).required().messages({
        'number.min': 'الدرجة لا يمكن أن تكون سالبة',
        'any.required': 'الدرجة مطلوبة',
    }),
    notes: Joi.string().optional().allow('', null),
});

export const updateStudentGradeSchema = Joi.object({
    marks: Joi.number().min(0).optional(),
    notes: Joi.string().optional().allow('', null),
});
