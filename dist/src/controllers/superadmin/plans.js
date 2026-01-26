"use strict";
// src/controllers/superadmin/subscriptionPlan.controller.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlan = exports.updatePlan = exports.getPlan = exports.getPlans = exports.createPlan = void 0;
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
const plans_1 = __importDefault(require("../../models/schema/superadmin/plans"));
// ═══════════════════════════════════════════════════════════════
// ➕ CREATE PLAN
// ═══════════════════════════════════════════════════════════════
const createPlan = async (req, res) => {
    const data = req.body;
    const plan = await plans_1.default.create(data);
    return (0, response_1.SuccessResponse)(res, { plan, message: 'تم إنشاء الخطة بنجاح' }, 201);
};
exports.createPlan = createPlan;
// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL PLANS
// ═══════════════════════════════════════════════════════════════
const getPlans = async (req, res) => {
    const { status } = req.body;
    const query = {};
    if (status)
        query.status = status;
    const plans = await plans_1.default.find(query).sort({ sortOrder: 1 });
    return (0, response_1.SuccessResponse)(res, { plans });
};
exports.getPlans = getPlans;
// ═══════════════════════════════════════════════════════════════
// 📄 GET SINGLE PLAN
// ═══════════════════════════════════════════════════════════════
const getPlan = async (req, res) => {
    const { planId } = req.body;
    const plan = await plans_1.default.findById(planId);
    if (!plan)
        throw new NotFound_1.NotFound('الخطة غير موجودة');
    return (0, response_1.SuccessResponse)(res, { plan });
};
exports.getPlan = getPlan;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PLAN
// ═══════════════════════════════════════════════════════════════
const updatePlan = async (req, res) => {
    const { planId, ...data } = req.body;
    const plan = await plans_1.default.findById(planId);
    if (!plan)
        throw new NotFound_1.NotFound('الخطة غير موجودة');
    Object.assign(plan, data);
    await plan.save();
    return (0, response_1.SuccessResponse)(res, { plan, message: 'تم تحديث الخطة بنجاح' });
};
exports.updatePlan = updatePlan;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE PLAN
// ═══════════════════════════════════════════════════════════════
const deletePlan = async (req, res) => {
    const { planId } = req.body;
    const plan = await plans_1.default.findById(planId);
    if (!plan)
        throw new NotFound_1.NotFound('الخطة غير موجودة');
    plan.status = 'inactive';
    await plan.save();
    return (0, response_1.SuccessResponse)(res, { message: 'تم إلغاء تفعيل الخطة' });
};
exports.deletePlan = deletePlan;
