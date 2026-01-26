"use strict";
// src/controllers/superadmin/subscription.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateSubscription = exports.suspendSubscription = exports.getSubscriptionDetails = exports.getSubscriptions = exports.createSubscription = void 0;
const Invoice_1 = __importDefault(require("../../models/schema/superadmin/Invoice"));
const school_1 = __importDefault(require("../../models/schema/superadmin/school"));
const response_1 = require("../../utils/response");
const payment_1 = __importDefault(require("../../models/schema/superadmin/payment"));
const Errors_1 = require("../../Errors");
const subscription_1 = __importDefault(require("../../models/schema/superadmin/subscription"));
const BadRequest_1 = require("../../Errors/BadRequest");
const plans_1 = __importDefault(require("../../models/schema/superadmin/plans"));
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE SUBSCRIPTION FOR SCHOOL
// ═══════════════════════════════════════════════════════════════
const createSubscription = async (req, res) => {
    const { schoolId, planId, discount, startDate, notes } = req.body;
    // التحقق من المدرسة
    const school = await school_1.default.findById(schoolId);
    if (!school)
        throw new Errors_1.NotFound('المدرسة غير موجودة');
    // التحقق من الخطة
    const plan = await plans_1.default.findOne({ _id: planId, status: 'active' });
    if (!plan)
        throw new Errors_1.NotFound('خطة الاشتراك غير موجودة');
    // التحقق من عدم وجود اشتراك نشط
    const existingActive = await subscription_1.default.findOne({
        school: schoolId,
        status: { $in: ['pending', 'active'] },
    });
    if (existingActive)
        throw new BadRequest_1.BadRequest('يوجد اشتراك نشط أو معلق لهذه المدرسة');
    // حساب التواريخ والمبالغ
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.duration);
    const discountAmount = discount || 0;
    const finalAmount = plan.price - discountAmount;
    // إنشاء الاشتراك
    const newSubscription = await subscription_1.default.create({
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
    const invoice = await Invoice_1.default.create({
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
    return (0, response_1.SuccessResponse)(res, {
        subscription: newSubscription,
        invoice,
        message: 'تم إنشاء الاشتراك والفاتورة بنجاح',
    }, 201);
};
exports.createSubscription = createSubscription;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL SUBSCRIPTIONS
// ═══════════════════════════════════════════════════════════════
const getSubscriptions = async (req, res) => {
    const { status, schoolId, page = 1, limit = 20 } = req.body;
    const query = {};
    if (status)
        query.status = status;
    if (schoolId)
        query.school = schoolId;
    const total = await subscription_1.default.countDocuments(query);
    const subscriptions = await subscription_1.default.find(query)
        .populate('school', 'name nameEn logo')
        .populate('plan', 'name nameEn price duration')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    return (0, response_1.SuccessResponse)(res, {
        subscriptions,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
};
exports.getSubscriptions = getSubscriptions;
// ═══════════════════════════════════════════════════════════════
// 📄 GET SUBSCRIPTION DETAILS
// ═══════════════════════════════════════════════════════════════
const getSubscriptionDetails = async (req, res) => {
    const { subscriptionId } = req.body;
    const subscriptionDoc = await subscription_1.default.findById(subscriptionId)
        .populate('school', 'name nameEn logo email phone')
        .populate('plan', 'name nameEn price duration features');
    if (!subscriptionDoc)
        throw new Errors_1.NotFound('الاشتراك غير موجود');
    // جلب الفواتير
    const invoices = await Invoice_1.default.find({ subscription: subscriptionId }).sort({ createdAt: -1 });
    // جلب المدفوعات
    const payments = await payment_1.default.find({ subscription: subscriptionId })
        .populate('paymentMethod', 'name nameEn type')
        .sort({ createdAt: -1 });
    return (0, response_1.SuccessResponse)(res, {
        subscription: subscriptionDoc,
        invoices,
        payments,
    });
};
exports.getSubscriptionDetails = getSubscriptionDetails;
// ═══════════════════════════════════════════════════════════════
// ⏸️ SUSPEND SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════
const suspendSubscription = async (req, res) => {
    const { subscriptionId, reason } = req.body;
    const subscriptionDoc = await subscription_1.default.findById(subscriptionId);
    if (!subscriptionDoc)
        throw new Errors_1.NotFound('الاشتراك غير موجود');
    if (subscriptionDoc.status !== 'active') {
        throw new BadRequest_1.BadRequest('لا يمكن إيقاف اشتراك غير نشط');
    }
    subscriptionDoc.status = 'suspended';
    subscriptionDoc.notes = reason || subscriptionDoc.notes;
    await subscriptionDoc.save();
    return (0, response_1.SuccessResponse)(res, { subscription: subscriptionDoc, message: 'تم إيقاف الاشتراك' });
};
exports.suspendSubscription = suspendSubscription;
// ═══════════════════════════════════════════════════════════════
// ▶️ ACTIVATE SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════
const activateSubscription = async (req, res) => {
    const superAdminId = req.user?.id;
    const { subscriptionId } = req.body;
    const subscriptionDoc = await subscription_1.default.findById(subscriptionId);
    if (!subscriptionDoc)
        throw new Errors_1.NotFound('الاشتراك غير موجود');
    subscriptionDoc.status = 'active';
    subscriptionDoc.activatedAt = new Date();
    await subscriptionDoc.save();
    return (0, response_1.SuccessResponse)(res, { subscription: subscriptionDoc, message: 'تم تفعيل الاشتراك' });
};
exports.activateSubscription = activateSubscription;
