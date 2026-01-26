"use strict";
// src/controllers/superadmin/schoolPayment.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentsSummary = exports.rejectPayment = exports.approvePayment = exports.getPaymentDetails = exports.getAllPayments = exports.getPendingPayments = void 0;
const payment_1 = __importDefault(require("../../models/schema/superadmin/payment"));
const Invoice_1 = __importDefault(require("../../models/schema/superadmin/Invoice"));
const subscription_1 = __importDefault(require("../../models/schema/superadmin/subscription"));
const response_1 = require("../../utils/response");
const Errors_1 = require("../../Errors");
const BadRequest_1 = require("../../Errors/BadRequest");
// ═══════════════════════════════════════════════════════════════
// 📋 GET PENDING PAYMENTS
// ═══════════════════════════════════════════════════════════════
const getPendingPayments = async (req, res) => {
    const total = await payment_1.default.countDocuments({ status: 'pending' });
    const payments = await payment_1.default.find({ status: 'pending' })
        .populate('school', 'name nameEn logo')
        .populate('paymentMethod', 'name nameEn type')
        .populate('invoice', 'invoiceNumber finalAmount')
        .sort({ createdAt: 1 });
    return (0, response_1.SuccessResponse)(res, {
        payments,
    });
};
exports.getPendingPayments = getPendingPayments;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL PAYMENTS
// ═══════════════════════════════════════════════════════════════
const getAllPayments = async (req, res) => {
    const { status, schoolId, startDate, endDate, page = 1, limit = 20 } = req.body;
    const query = {};
    if (status)
        query.status = status;
    if (schoolId)
        query.school = schoolId;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate)
            query.createdAt.$gte = new Date(startDate);
        if (endDate)
            query.createdAt.$lte = new Date(endDate);
    }
    const total = await payment_1.default.countDocuments(query);
    const payments = await payment_1.default.find(query)
        .populate('school', 'name nameEn logo')
        .populate('paymentMethod', 'name nameEn type')
        .populate('invoice', 'invoiceNumber finalAmount')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    return (0, response_1.SuccessResponse)(res, {
        payments,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
};
exports.getAllPayments = getAllPayments;
// ═══════════════════════════════════════════════════════════════
// 📄 GET PAYMENT DETAILS
// ═══════════════════════════════════════════════════════════════
const getPaymentDetails = async (req, res) => {
    const { paymentId } = req.body;
    const payment = await payment_1.default.findById(paymentId)
        .populate('school', 'name nameEn logo email phone')
        .populate('paymentMethod', 'name nameEn type accountNumber')
        .populate('invoice', 'invoiceNumber amount finalAmount dueDate')
        .populate('subscription', 'startDate endDate status')
        .populate('reviewedBy', 'name');
    if (!payment)
        throw new Errors_1.NotFound('الدفعة غير موجودة');
    return (0, response_1.SuccessResponse)(res, { payment });
};
exports.getPaymentDetails = getPaymentDetails;
// ═══════════════════════════════════════════════════════════════
// ✅ APPROVE PAYMENT
// ═══════════════════════════════════════════════════════════════
const approvePayment = async (req, res) => {
    const superAdminId = req.user?.id;
    const { paymentId } = req.body;
    const payment = await payment_1.default.findById(paymentId);
    if (!payment)
        throw new Errors_1.NotFound('الدفعة غير موجودة');
    if (payment.status !== 'pending') {
        throw new BadRequest_1.BadRequest('هذه الدفعة تمت مراجعتها مسبقاً');
    }
    // تحديث الدفعة
    payment.status = 'approved';
    payment.reviewedAt = new Date();
    await payment.save();
    // تحديث الفاتورة
    const invoice = await Invoice_1.default.findById(payment.invoice);
    if (invoice) {
        invoice.paidAmount += payment.amount;
        invoice.remainingAmount -= payment.amount;
        if (invoice.remainingAmount <= 0) {
            invoice.status = 'paid';
        }
        else if (invoice.paidAmount > 0) {
            invoice.status = 'partial';
        }
        await invoice.save();
    }
    // تحديث الاشتراك
    const subscription = await subscription_1.default.findById(payment.subscription);
    if (subscription) {
        subscription.paidAmount += payment.amount;
        subscription.remainingAmount -= payment.amount;
        // تفعيل الاشتراك إذا تم الدفع بالكامل
        if (subscription.remainingAmount <= 0 && subscription.status === 'pending') {
            subscription.status = 'active';
            subscription.activatedAt = new Date();
        }
        await subscription.save();
    }
    await payment.populate('school', 'name nameEn');
    return (0, response_1.SuccessResponse)(res, {
        payment,
        invoice: invoice
            ? {
                paidAmount: invoice.paidAmount,
                remainingAmount: invoice.remainingAmount,
                status: invoice.status,
            }
            : null,
        subscription: subscription
            ? {
                paidAmount: subscription.paidAmount,
                remainingAmount: subscription.remainingAmount,
                status: subscription.status,
            }
            : null,
        message: 'تم قبول الدفعة بنجاح',
    });
};
exports.approvePayment = approvePayment;
// ═══════════════════════════════════════════════════════════════
// ❌ REJECT PAYMENT
// ═══════════════════════════════════════════════════════════════
const rejectPayment = async (req, res) => {
    const superAdminId = req.user?.id;
    const { paymentId, rejectionReason } = req.body;
    if (!rejectionReason) {
        throw new BadRequest_1.BadRequest('سبب الرفض مطلوب');
    }
    const payment = await payment_1.default.findById(paymentId);
    if (!payment)
        throw new Errors_1.NotFound('الدفعة غير موجودة');
    if (payment.status !== 'pending') {
        throw new BadRequest_1.BadRequest('هذه الدفعة تمت مراجعتها مسبقاً');
    }
    payment.status = 'rejected';
    payment.reviewedAt = new Date();
    payment.rejectionReason = rejectionReason;
    await payment.save();
    await payment.populate('school', 'name nameEn');
    return (0, response_1.SuccessResponse)(res, { payment, message: 'تم رفض الدفعة' });
};
exports.rejectPayment = rejectPayment;
// ═══════════════════════════════════════════════════════════════
// 📊 PAYMENTS SUMMARY
// ═══════════════════════════════════════════════════════════════
const getPaymentsSummary = async (req, res) => {
    const { startDate, endDate } = req.body;
    const match = {};
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate)
            match.createdAt.$gte = new Date(startDate);
        if (endDate)
            match.createdAt.$lte = new Date(endDate);
    }
    const summary = await payment_1.default.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
            },
        },
    ]);
    const result = {
        pending: { count: 0, amount: 0 },
        approved: { count: 0, amount: 0 },
        rejected: { count: 0, amount: 0 },
        total: { count: 0, amount: 0 },
    };
    summary.forEach((item) => {
        result[item._id] = {
            count: item.count,
            amount: item.totalAmount,
        };
        result.total.count += item.count;
        if (item._id === 'approved') {
            result.total.amount += item.totalAmount;
        }
    });
    return (0, response_1.SuccessResponse)(res, { summary: result });
};
exports.getPaymentsSummary = getPaymentsSummary;
