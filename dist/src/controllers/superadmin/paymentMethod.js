"use strict";
// src/controllers/superadmin/paymentMethod.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentMethod = exports.updatePaymentMethod = exports.getPaymentMethods = exports.createPaymentMethod = void 0;
const NotFound_1 = require("../../Errors/NotFound");
const paymentMethod_1 = __importDefault(require("../../models/schema/superadmin/paymentMethod"));
const response_1 = require("../../utils/response");
const handleImages_1 = require("../../utils/handleImages");
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE PAYMENT METHOD
// ═══════════════════════════════════════════════════════════════
const createPaymentMethod = async (req, res) => {
    const { logo, ...data } = req.body;
    let logoPath;
    if (logo) {
        logoPath = await (0, handleImages_1.saveBase64Image)(logo, `method-${Date.now()}`, req, 'payment-methods');
    }
    const method = await paymentMethod_1.default.create({
        ...data,
        logo: logoPath,
    });
    return (0, response_1.SuccessResponse)(res, { method, message: 'تم إضافة طريقة الدفع بنجاح' }, 201);
};
exports.createPaymentMethod = createPaymentMethod;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL PAYMENT METHODS
// ═══════════════════════════════════════════════════════════════
const getPaymentMethods = async (req, res) => {
    const { status } = req.body;
    const query = {};
    if (status)
        query.status = status;
    const methods = await paymentMethod_1.default.find(query).sort({ sortOrder: 1 });
    return (0, response_1.SuccessResponse)(res, { methods });
};
exports.getPaymentMethods = getPaymentMethods;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PAYMENT METHOD
// ═══════════════════════════════════════════════════════════════
const updatePaymentMethod = async (req, res) => {
    const { methodId, logo, ...data } = req.body;
    const method = await paymentMethod_1.default.findById(methodId);
    if (!method)
        throw new NotFound_1.NotFound('طريقة الدفع غير موجودة');
    if (logo && logo.startsWith('data:')) {
        data.logo = await (0, handleImages_1.saveBase64Image)(logo, `method-${Date.now()}`, req, 'payment-methods');
    }
    Object.assign(method, data);
    await method.save();
    return (0, response_1.SuccessResponse)(res, { method, message: 'تم تحديث طريقة الدفع بنجاح' });
};
exports.updatePaymentMethod = updatePaymentMethod;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE PAYMENT METHOD
// ═══════════════════════════════════════════════════════════════
const deletePaymentMethod = async (req, res) => {
    const { methodId } = req.body;
    const method = await paymentMethod_1.default.findById(methodId);
    if (!method)
        throw new NotFound_1.NotFound('طريقة الدفع غير موجودة');
    method.status = 'inactive';
    await method.save();
    return (0, response_1.SuccessResponse)(res, { message: 'تم إلغاء تفعيل طريقة الدفع' });
};
exports.deletePaymentMethod = deletePaymentMethod;
