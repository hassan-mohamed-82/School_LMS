import Joi from 'joi';

// Action Schema
const actionSchema = Joi.object({
    action: Joi.string().required().messages({
        'string.empty': 'الإجراء مطلوب',
        'any.required': 'الإجراء مطلوب',
    }),
});

// Permission Schema
const permissionSchema = Joi.object({
    module: Joi.string().required().messages({
        'string.empty': 'الموديول مطلوب',
        'any.required': 'الموديول مطلوب',
    }),
    actions: Joi.array().items(actionSchema).min(1).required().messages({
        'array.min': 'يجب اختيار إجراء واحد على الأقل',
        'any.required': 'الإجراءات مطلوبة',
    }),
});

// Create Role
export const createRoleSchema = Joi.object({
    name: Joi.string().min(2).required().messages({
        'string.empty': 'اسم الدور مطلوب',
        'string.min': 'اسم الدور يجب أن يكون حرفين على الأقل',
        'any.required': 'اسم الدور مطلوب',
    }),
    permissions: Joi.array().items(permissionSchema).min(1).required().messages({
        'array.min': 'يجب اختيار صلاحية واحدة على الأقل',
        'any.required': 'الصلاحيات مطلوبة',
    }),
    status: Joi.string().valid('active', 'inactive').default('active').messages({
        'any.only': 'الحالة يجب أن تكون active أو inactive',
    }),
});

// Update Role
export const updateRoleSchema = Joi.object({
    name: Joi.string().min(2).messages({
        'string.min': 'اسم الدور يجب أن يكون حرفين على الأقل',
    }),
    permissions: Joi.array().items(permissionSchema).min(1).messages({
        'array.min': 'يجب اختيار صلاحية واحدة على الأقل',
    }),
    status: Joi.string().valid('active', 'inactive').messages({
        'any.only': 'الحالة يجب أن تكون active أو inactive',
    }),
});
