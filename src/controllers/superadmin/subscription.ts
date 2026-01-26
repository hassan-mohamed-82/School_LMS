// src/controllers/superadmin/subscription.controller.ts

import { Request, Response } from 'express';
import Invoice from '../../models/schema/superadmin/Invoice';
import School from '../../models/schema/superadmin/school';
import { SuccessResponse } from '../../utils/response';
import SchoolPayment from '../../models/schema/superadmin/payment';
import { NotFound } from '../../Errors';
import Subscription from '../../models/schema/superadmin/subscription';
import { BadRequest } from '../../Errors/BadRequest';
import SubscriptionPlan from '../../models/schema/superadmin/plans';
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE SUBSCRIPTION FOR SCHOOL
// ═══════════════════════════════════════════════════════════════

export const createSubscription = async (req: Request, res: Response) => {
    const { schoolId, planId, discount, startDate, notes } = req.body;

    // التحقق من المدرسة
    const school = await School.findById(schoolId);
    if (!school) throw new NotFound('المدرسة غير موجودة');

    // التحقق من الخطة
    const plan = await SubscriptionPlan.findOne({ _id: planId, status: 'active' });
    if (!plan) throw new NotFound('خطة الاشتراك غير موجودة');

    // التحقق من عدم وجود اشتراك نشط
    const existingActive = await Subscription.findOne({
        school: schoolId,
        status: { $in: ['pending', 'active'] },
    });
    if (existingActive) throw new BadRequest('يوجد اشتراك نشط أو معلق لهذه المدرسة');

    // حساب التواريخ والمبالغ
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);

    const discountAmount = discount || 0;
    const finalAmount = plan.price - discountAmount;

    // إنشاء الاشتراك
    const newSubscription = await Subscription.create({
        school: schoolId,
        plan: planId,
        startDate: start,
        endDate: end,
        price: plan.price,
        discount: discountAmount,
        finalAmount,
        paidAmount: 0,
        remainingAmount: finalAmount,
        status: 'pending',
        notes,
    });

    // إنشاء فاتورة
    const invoice = await Invoice.create({
        school: schoolId,
        subscription: newSubscription._id,
        amount: plan.price,
        discount: discountAmount,
        finalAmount,
        paidAmount: 0,
        remainingAmount: finalAmount,
        dueDate: start,
        status: 'pending',
    });

    await newSubscription.populate('plan', 'name nameEn price duration');
    await newSubscription.populate('school', 'name nameEn');

    return SuccessResponse(
        res,
        {
            subscription: newSubscription,
            invoice,
            message: 'تم إنشاء الاشتراك والفاتورة بنجاح',
        },
        201
    );
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════

export const getSubscriptions = async (req: Request, res: Response) => {
    const { status, schoolId, page = 1, limit = 20 } = req.body;

    const query: any = {};
    if (status) query.status = status;
    if (schoolId) query.school = schoolId;

    const total = await Subscription.countDocuments(query);
    const subscriptions = await Subscription.find(query)
        .populate('school', 'name nameEn logo')
        .populate('plan', 'name nameEn price duration')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return SuccessResponse(res, {
        subscriptions,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
};

// ═══════════════════════════════════════════════════════════════
// 📄 GET SUBSCRIPTION DETAILS
// ═══════════════════════════════════════════════════════════════

export const getSubscriptionDetails = async (req: Request, res: Response) => {
    const { subscriptionId } = req.body;

    const subscriptionDoc = await Subscription.findById(subscriptionId)
        .populate('school', 'name nameEn logo email phone')
        .populate('plan', 'name nameEn price duration features');

    if (!subscriptionDoc) throw new NotFound('الاشتراك غير موجود');

    // جلب الفواتير
    const invoices = await Invoice.find({ subscription: subscriptionId }).sort({ createdAt: -1 });

    // جلب المدفوعات
    const payments = await SchoolPayment.find({ subscription: subscriptionId })
        .populate('paymentMethod', 'name nameEn type')
        .sort({ createdAt: -1 });

    return SuccessResponse(res, {
        subscription: subscriptionDoc,
        invoices,
        payments,
    });
};

// ═══════════════════════════════════════════════════════════════
// ⏸️ SUSPEND SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════

export const suspendSubscription = async (req: Request, res: Response) => {
    const { subscriptionId, reason } = req.body;

    const subscriptionDoc = await Subscription.findById(subscriptionId);
    if (!subscriptionDoc) throw new NotFound('الاشتراك غير موجود');

    if (subscriptionDoc.status !== 'active') {
        throw new BadRequest('لا يمكن إيقاف اشتراك غير نشط');
    }

    subscriptionDoc.status = 'suspended';
    subscriptionDoc.notes = reason || subscriptionDoc.notes;
    await subscriptionDoc.save();

    return SuccessResponse(res, { subscription: subscriptionDoc, message: 'تم إيقاف الاشتراك' });
};

// ═══════════════════════════════════════════════════════════════
// ▶️ ACTIVATE SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════

export const activateSubscription = async (req: Request, res: Response) => {
    const superAdminId = req.user?.id;
    const { subscriptionId } = req.body;

    const subscriptionDoc = await Subscription.findById(subscriptionId);
    if (!subscriptionDoc) throw new NotFound('الاشتراك غير موجود');

    subscriptionDoc.status = 'active';
    subscriptionDoc.activatedAt = new Date();
    await subscriptionDoc.save();

    return SuccessResponse(res, { subscription: subscriptionDoc, message: 'تم تفعيل الاشتراك' });
};
