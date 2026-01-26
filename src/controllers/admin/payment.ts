// src/controllers/admin/schoolPayment.controller.ts

import { Request, Response } from 'express';
import Payment from '../../models/schema/superadmin/payment';
import Invoice from '../../models/schema/superadmin/Invoice';
import Subscription from '../../models/schema/superadmin/subscription';
import PaymentMethod from '../../models/schema/superadmin/paymentMethod';
import { SuccessResponse } from '../../utils/response';
import { BadRequest } from '../../Errors/BadRequest';
import { NotFound } from '../../Errors';
import { saveBase64Image } from '../../utils/handleImages';

// ═══════════════════════════════════════════════════════════════
// 📋 GET MY INVOICES
// ═══════════════════════════════════════════════════════════════

export const getMyInvoices = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;

    const invoices = await Invoice.find({ school: schoolId })
        .populate('subscription', 'plan startDate endDate status')
        .sort({ createdAt: -1 });

    return SuccessResponse(res, { invoices });
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET PAYMENT METHODS
// ═══════════════════════════════════════════════════════════════

export const getPaymentMethods = async (req: Request, res: Response) => {
    const methods = await PaymentMethod.find({ status: 'active' }).sort({ sortOrder: 1 });

    return SuccessResponse(res, { methods });
};

// ═══════════════════════════════════════════════════════════════
// 💳 SUBMIT PAYMENT
// ═══════════════════════════════════════════════════════════════

export const submitPayment = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { invoiceId, paymentMethodId, amount, transactionId, receiptImage, notes } = req.body;

    // التحقق من الفاتورة
    const invoice = await Invoice.findOne({ _id: invoiceId, school: schoolId });
    if (!invoice) throw new NotFound('الفاتورة غير موجودة');

    if (invoice.status === 'paid') {
        throw new BadRequest('هذه الفاتورة مدفوعة بالكامل');
    }

    if (amount > invoice.remainingAmount) {
        throw new BadRequest(`المبلغ (${amount}) أكبر من المتبقي (${invoice.remainingAmount})`);
    }

    // التحقق من طريقة الدفع
    const paymentMethod = await PaymentMethod.findOne({ _id: paymentMethodId, status: 'active' });
    if (!paymentMethod) throw new NotFound('طريقة الدفع غير موجودة');

    // التحقق من صورة الإيصال
    if (!receiptImage) {
        throw new BadRequest('صورة إيصال الدفع مطلوبة');
    }

    // حفظ الصورة
    const receiptImagePath = await saveBase64Image(receiptImage, `payment-${Date.now()}`, req, 'school-payments');

    // إنشاء الدفعة
    const payments = await Payment.create({
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

    return SuccessResponse(
        res,
        {
            payments,
            message: 'تم رفع إيصال الدفع بنجاح، في انتظار المراجعة',
        },
        201
    );
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET MY PAYMENTS
// ═══════════════════════════════════════════════════════════════

export const getMyPayments = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;
    const { status } = req.body;

    const query: any = { school: schoolId };
    if (status) query.status = status;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
        .populate('paymentMethod', 'name nameEn type')
        .populate('invoice', 'invoiceNumber finalAmount')
        .sort({ createdAt: -1 })

    return SuccessResponse(res, {
        payments,
    });
};

// ═══════════════════════════════════════════════════════════════
// 📄 GET MY SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════

export const getMySubscription = async (req: Request, res: Response) => {
    const schoolId = req.user?.schoolId;

    const subscription = await Subscription.findOne({
        school: schoolId,
        status: { $in: ['pending', 'active'] },
    }).populate('plan', 'name nameEn price duration features maxStudents maxTeachers');

    if (!subscription) {
        return SuccessResponse(res, { subscription: null, message: 'لا يوجد اشتراك نشط' });
    }

    // حساب الأيام المتبقية
    const now = new Date();
    const daysRemaining = Math.ceil(
        (subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return SuccessResponse(res, {
        subscription,
        daysRemaining: Math.max(0, daysRemaining),
    });
};
