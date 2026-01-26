// src/controllers/superadmin/schoolPayment.controller.ts

import { Request, Response } from 'express';
import SchoolPayment from '../../models/schema/superadmin/payment';
import Invoice from '../../models/schema/superadmin/Invoice';
import Subscription from '../../models/schema/superadmin/subscription';
import { SuccessResponse } from '../../utils/response';
import { NotFound } from '../../Errors';
import { BadRequest } from '../../Errors/BadRequest';

// ═══════════════════════════════════════════════════════════════
// 📋 GET PENDING PAYMENTS
// ═══════════════════════════════════════════════════════════════

export const getPendingPayments = async (req: Request, res: Response) => {

    const total = await SchoolPayment.countDocuments({ status: 'pending' });
    const payments = await SchoolPayment.find({ status: 'pending' })
        .populate('school', 'name nameEn logo')
        .populate('paymentMethod', 'name nameEn type')
        .populate('invoice', 'invoiceNumber finalAmount')
        .sort({ createdAt: 1 })
        

    return SuccessResponse(res, {
        payments,
    });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL PAYMENTS
// ═══════════════════════════════════════════════════════════════

export const getAllPayments = async (req: Request, res: Response) => {
    const { status, schoolId, startDate, endDate, page = 1, limit = 20 } = req.body;

    const query: any = {};
    if (status) query.status = status;
    if (schoolId) query.school = schoolId;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await SchoolPayment.countDocuments(query);
    const payments = await SchoolPayment.find(query)
        .populate('school', 'name nameEn logo')
        .populate('paymentMethod', 'name nameEn type')
        .populate('invoice', 'invoiceNumber finalAmount')
        .populate('reviewedBy', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return SuccessResponse(res, {
        payments,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
};

// ═══════════════════════════════════════════════════════════════
// 📄 GET PAYMENT DETAILS
// ═══════════════════════════════════════════════════════════════

export const getPaymentDetails = async (req: Request, res: Response) => {
    const { paymentId } = req.body;

    const payment = await SchoolPayment.findById(paymentId)
        .populate('school', 'name nameEn logo email phone')
        .populate('paymentMethod', 'name nameEn type accountNumber')
        .populate('invoice', 'invoiceNumber amount finalAmount dueDate')
        .populate('subscription', 'startDate endDate status')
        .populate('reviewedBy', 'name');

    if (!payment) throw new NotFound('الدفعة غير موجودة');

    return SuccessResponse(res, { payment });
};

// ═══════════════════════════════════════════════════════════════
// ✅ APPROVE PAYMENT
// ═══════════════════════════════════════════════════════════════

export const approvePayment = async (req: Request, res: Response) => {
    const superAdminId = req.user?.id;
    const { paymentId } = req.body;

    const payment = await SchoolPayment.findById(paymentId);
    if (!payment) throw new NotFound('الدفعة غير موجودة');

    if (payment.status !== 'pending') {
        throw new BadRequest('هذه الدفعة تمت مراجعتها مسبقاً');
    }

    // تحديث الدفعة
    payment.status = 'approved';
    payment.reviewedAt = new Date();
    await payment.save();

    // تحديث الفاتورة
    const invoice = await Invoice.findById(payment.invoice);
    if (invoice) {
        invoice.paidAmount += payment.amount;
        invoice.remainingAmount -= payment.amount;

        if (invoice.remainingAmount <= 0) {
            invoice.status = 'paid';
        } else if (invoice.paidAmount > 0) {
            invoice.status = 'partial';
        }
        await invoice.save();
    }

    // تحديث الاشتراك
    const subscription = await Subscription.findById(payment.subscription);
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

    return SuccessResponse(res, {
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

// ═══════════════════════════════════════════════════════════════
// ❌ REJECT PAYMENT
// ═══════════════════════════════════════════════════════════════

export const rejectPayment = async (req: Request, res: Response) => {
    const superAdminId = req.user?.id;
    const { paymentId, rejectionReason } = req.body;

    if (!rejectionReason) {
        throw new BadRequest('سبب الرفض مطلوب');
    }

    const payment = await SchoolPayment.findById(paymentId);
    if (!payment) throw new NotFound('الدفعة غير موجودة');

    if (payment.status !== 'pending') {
        throw new BadRequest('هذه الدفعة تمت مراجعتها مسبقاً');
    }

    payment.status = 'rejected';
    payment.reviewedAt = new Date();
    payment.rejectionReason = rejectionReason;
    await payment.save();

    await payment.populate('school', 'name nameEn');

    return SuccessResponse(res, { payment, message: 'تم رفض الدفعة' });
};

// ═══════════════════════════════════════════════════════════════
// 📊 PAYMENTS SUMMARY
// ═══════════════════════════════════════════════════════════════

export const getPaymentsSummary = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.body;

    const match: any = {};
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const summary = await SchoolPayment.aggregate([
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
        result[item._id as keyof typeof result] = {
            count: item.count,
            amount: item.totalAmount,
        };
        result.total.count += item.count;
        if (item._id === 'approved') {
            result.total.amount += item.totalAmount;
        }
    });

    return SuccessResponse(res, { summary: result });
};
