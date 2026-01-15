import  Joi  from "joi";

export const createTeacherSchema = Joi.object({
    school: Joi.string(),
    name: Joi.string().min(2).required(),
    phone: Joi.string().min(10).required(),
    password: Joi.string().min(6).required(),
    gender: Joi.string().valid('male', 'female').optional(),
    dateOfBirth: Joi.string().optional(),
    address: Joi.string().optional(),
    avatar: Joi.string().optional(),
    subjects: Joi.array().optional().default([]),
    status: Joi.string().valid('active', 'inactive').optional().default('active'),
});

export const updateTeacherSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    phone: Joi.string().min(10).optional(),
    gender: Joi.string().valid('male', 'female').optional(),
    dateOfBirth: Joi.string().optional(),
    address: Joi.string().optional(),
    avatar: Joi.string().optional(),
    subjects: Joi.array().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
});
