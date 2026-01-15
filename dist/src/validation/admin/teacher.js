"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacherSchema = exports.createTeacherSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createTeacherSchema = joi_1.default.object({
    school: joi_1.default.string(),
    name: joi_1.default.string().min(2).required(),
    phone: joi_1.default.string().min(10).required(),
    password: joi_1.default.string().min(6).required(),
    gender: joi_1.default.string().valid('male', 'female').optional(),
    dateOfBirth: joi_1.default.string().optional(),
    address: joi_1.default.string().optional(),
    avatar: joi_1.default.string().optional(),
    subjects: joi_1.default.array().optional().default([]),
    status: joi_1.default.string().valid('active', 'inactive').optional().default('active'),
});
exports.updateTeacherSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).optional(),
    phone: joi_1.default.string().min(10).optional(),
    gender: joi_1.default.string().valid('male', 'female').optional(),
    dateOfBirth: joi_1.default.string().optional(),
    address: joi_1.default.string().optional(),
    avatar: joi_1.default.string().optional(),
    subjects: joi_1.default.array().optional(),
    status: joi_1.default.string().valid('active', 'inactive').optional(),
});
