"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePeriodSchema = exports.createPeriodSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createPeriodSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required().messages({
        'string.empty': 'اسم الحصة مطلوب',
        'string.min': 'الاسم يجب أن يكون حرفين على الأقل',
    }),
    nameEn: joi_1.default.string().optional(),
    startTime: joi_1.default.string().required().messages({
        'string.empty': 'وقت البداية مطلوب',
    }),
    endTime: joi_1.default.string().required().messages({
        'string.empty': 'وقت النهاية مطلوب',
    }),
    sortOrder: joi_1.default.number().optional().default(0),
    status: joi_1.default.string().valid('active', 'inactive').optional().default('active'),
});
exports.updatePeriodSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).optional(),
    nameEn: joi_1.default.string().optional().allow('', null),
    startTime: joi_1.default.string().optional(),
    endTime: joi_1.default.string().optional(),
    sortOrder: joi_1.default.number().optional(),
    status: joi_1.default.string().valid('active', 'inactive').optional(),
});
