"use strict";
// src/controllers/admin/schoolPayment.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMySubscription = exports.getMyPayments = exports.submitPayment = exports.getPaymentMethods = exports.getMyInvoices = void 0;
const payment_1 = __importDefault(require("../../models/schema/superadmin/payment"));
const Invoice_1 = __importDefault(require("../../models/schema/superadmin/Invoice"));
const subscription_1 = __importDefault(require("../../models/schema/superadmin/subscription"));
const paymentMethod_1 = __importDefault(require("../../models/schema/superadmin/paymentMethod"));
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const Errors_1 = require("../../Errors");
const handleImages_1 = require("../../utils/handleImages");
// ═══════════════════════════════════════════════════════════════
// 📋 GET MY INVOICES
// ═══════════════════════════════════════════════════════════════
const getMyInvoices = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const invoices = await Invoice_1.default.find({ school: schoolId })
        .populate('subscription', 'plan startDate endDate status')
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, { invoices });
};
exports.getMyInvoices = getMyInvoices;
// ═══════════════════════════════════════════════════════════════
// 📋 GET PAYMENT METHODS
// ═══════════════════════════════════════════════════════════════
const getPaymentMethods = async (req, res) => {
    const methods = await paymentMethod_1.default.find({ status: 'active' }).sort({ sortOrder: 1 });
    return (0, response_1.SuccessResponse)(res, { methods });
};
exports.getPaymentMethods = getPaymentMethods;
// ═══════════════════════════════════════════════════════════════
// 💳 SUBMIT PAYMENT
// ═══════════════════════════════════════════════════════════════
const submitPayment = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { invoiceId, paymentMethodId, amount, transactionId, receiptImage, notes } = req.body;
    // التحقق من الفاتورة
    const invoice = await Invoice_1.default.findOne({ _id: invoiceId, school: schoolId });
    if (!invoice)
        throw new Errors_1.NotFound('الفاتورة غير موجودة');
    if (invoice.status === 'paid') {
        throw new BadRequest_1.BadRequest('هذه الفاتورة مدفوعة بالكامل');
    }
    if (amount > invoice.remainingAmount) {
        throw new BadRequest_1.BadRequest(`المبلغ (${amount}) أكبر من المتبقي (${invoice.remainingAmount})`);
    }
    // التحقق من طريقة الدفع
    const paymentMethod = await paymentMethod_1.default.findOne({ _id: paymentMethodId, status: 'active' });
    if (!paymentMethod)
        throw new Errors_1.NotFound('طريقة الدفع غير موجودة');
    // التحقق من صورة الإيصال
    if (!receiptImage) {
        throw new BadRequest_1.BadRequest('صورة إيصال الدفع مطلوبة');
    }
    // حفظ الصورة
    const receiptImagePath = await (0, handleImages_1.saveBase64Image)(receiptImage, `payment-${Date.now()}`, req, 'school-payments');
    // إنشاء الدفعة
    const payments = await payment_1.default.create({
        school: schoolId,
        subscription: invoice.subscription,
        invoice: invoiceId,
        paymentMethod: paymentMethodId,
        amount,
        transactionId,
        receiptImage: receiptImagePath,
        notes,
        status: 'pending',
    });
    await payments.populate('paymentMethod', 'name nameEn type');
    return (0, response_1.SuccessResponse)(res, {
        payments,
        message: 'تم رفع إيصال الدفع بنجاح، في انتظار المراجعة',
    }, 201);
};
exports.submitPayment = submitPayment;
// ═══════════════════════════════════════════════════════════════
// 📋 GET MY PAYMENTS
// ═══════════════════════════════════════════════════════════════
const getMyPayments = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const { status } = req.body;
    const query = { school: schoolId };
    if (status)
        query.status = status;
    const total = await payment_1.default.countDocuments(query);
    const payments = await payment_1.default.find(query)
        .populate('paymentMethod', 'name nameEn type')
        .populate('invoice', 'invoiceNumber finalAmount')
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, {
        payments,
    });
};
exports.getMyPayments = getMyPayments;
// ═══════════════════════════════════════════════════════════════
// 📄 GET MY SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════
const getMySubscription = async (req, res) => {
    const schoolId = req.user?.schoolId;
    const subscription = await subscription_1.default.findOne({
        school: schoolId,
        status: { $in: ['pending', 'active'] },
    }).populate('plan', 'name nameEn price duration features maxStudents maxTeachers');
    if (!subscription) {
        return (0, response_1.SuccessResponse)(res, { subscription: null, message: 'لا يوجد اشتراك نشط' });
    }
    // حساب الأيام المتبقية
    const now = new Date();
    const daysRemaining = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return (0, response_1.SuccessResponse)(res, {
        subscription,
        daysRemaining: Math.max(0, daysRemaining),
    });
};
exports.getMySubscription = getMySubscription;
