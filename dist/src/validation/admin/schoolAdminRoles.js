"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRoleSchema = exports.createRoleSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Action Schema
const actionSchema = joi_1.default.object({
    action: joi_1.default.string().required().messages({
        'string.empty': 'الإجراء مطلوب',
        'any.required': 'الإجراء مطلوب',
    }),
});
// Permission Schema
const permissionSchema = joi_1.default.object({
    module: joi_1.default.string().required().messages({
        'string.empty': 'الموديول مطلوب',
        'any.required': 'الموديول مطلوب',
    }),
    actions: joi_1.default.array().items(actionSchema).min(1).required().messages({
        'array.min': 'يجب اختيار إجراء واحد على الأقل',
        'any.required': 'الإجراءات مطلوبة',
    }),
});
// Create Role
exports.createRoleSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required().messages({
        'string.empty': 'اسم الدور مطلوب',
        'string.min': 'اسم الدور يجب أن يكون حرفين على الأقل',
        'any.required': 'اسم الدور مطلوب',
    }),
    permissions: joi_1.default.array().items(permissionSchema).min(1).required().messages({
        'array.min': 'يجب اختيار صلاحية واحدة على الأقل',
        'any.required': 'الصلاحيات مطلوبة',
    }),
    status: joi_1.default.string().valid('active', 'inactive').default('active').messages({
        'any.only': 'الحالة يجب أن تكون active أو inactive',
    }),
});
// Update Role
exports.updateRoleSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).messages({
        'string.min': 'اسم الدور يجب أن يكون حرفين على الأقل',
    }),
    permissions: joi_1.default.array().items(permissionSchema).min(1).messages({
        'array.min': 'يجب اختيار صلاحية واحدة على الأقل',
    }),
    status: joi_1.default.string().valid('active', 'inactive').messages({
        'any.only': 'الحالة يجب أن تكون active أو inactive',
    }),
});
