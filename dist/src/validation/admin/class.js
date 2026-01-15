"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClassSchema = exports.createClassSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createClassSchema = joi_1.default.object({
    gradeId: joi_1.default.string().required().messages({
        'string.empty': 'المرحلة مطلوبة',
    }),
    name: joi_1.default.string().min(1).required().messages({
        'string.empty': 'اسم الفصل مطلوب',
    }),
    capacity: joi_1.default.number().min(1).optional(),
    status: joi_1.default.string().valid('active', 'inactive').optional().default('active'),
});
exports.updateClassSchema = joi_1.default.object({
    gradeId: joi_1.default.string().optional(),
    name: joi_1.default.string().min(1).optional(),
    capacity: joi_1.default.number().min(1).optional().allow(null),
    status: joi_1.default.string().valid('active', 'inactive').optional(),
});
