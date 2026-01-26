import Joi from 'joi';

// بدء حصة - scheduleId فقط
export const startSessionSchema = Joi.object({
    scheduleId: Joi.string().required().messages({
        'any.required': 'معرف الجدول مطلوب',
    }),
});

// تسجيل حضور - بدون sessionId
export const recordAttendanceSchema = Joi.object({
    attendance: Joi.array()
        .items(
            Joi.object({
                studentId: Joi.string().required().messages({
                    'any.required': 'معرف الطالب مطلوب',
                }),
                status: Joi.string()
                    .valid('present', 'absent', 'late', 'excused')
                    .required()
                    .messages({
                        'any.required': 'حالة الحضور مطلوبة',
                        'any.only': 'حالة الحضور يجب أن تكون: present, absent, late, excused',
                    }),
                notes: Joi.string().optional().allow('', null),
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'يجب إرسال حضور طالب واحد على الأقل',
            'any.required': 'بيانات الحضور مطلوبة',
        }),
});

// إنهاء حصة - بدون sessionId
export const endSessionSchema = Joi.object({
    notes: Joi.string().optional().allow('', null),
});

// رفع واجب - بدون IDs
export const uploadHomeworkSchema = Joi.object({
    title: Joi.string().min(3).optional().allow('', null),
    description: Joi.string().optional().allow('', null),
    dueDate: Joi.date().optional().allow(null),
    file: Joi.any().optional(), // عشان ده هييجي من multer مش من body
});