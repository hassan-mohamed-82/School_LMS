"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParentSchema = exports.createParentSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createParentSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required().messages({
        'string.empty': 'اسم ولي الأمر مطلوب',
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    phone: joi_1.default.string().min(10).required().messages({
        'string.empty': 'رقم الهاتف مطلوب',
        'string.min': 'رقم الهاتف غير صحيح',
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.empty': 'كلمة المرور مطلوبة',
        'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    }),
    address: joi_1.default.string().optional(),
    avatar: joi_1.default.string().optional(),
    status: joi_1.default.string().valid('active', 'inactive').optional().default('active'),
});
exports.updateParentSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).optional(),
    phone: joi_1.default.string().min(10).optional(),
    password: joi_1.default.string().min(6).optional(),
    address: joi_1.default.string().optional().allow('', null),
    avatar: joi_1.default.string().optional().allow('', null),
    status: joi_1.default.string().valid('active', 'inactive').optional(),
});
