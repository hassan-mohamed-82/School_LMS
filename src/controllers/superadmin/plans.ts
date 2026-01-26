// src/controllers/superadmin/subscriptionPlan.controller.ts

import { Request, Response } from 'express';
import { SuccessResponse } from "../../utils/response";
import { NotFound } from '../../Errors/NotFound';
import SubscriptionPlan from '../../models/schema/superadmin/plans';

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE PLAN
// ═══════════════════════════════════════════════════════════════

export const createPlan = async (req: Request, res: Response) => {
    const data = req.body;

    const plan = await SubscriptionPlan.create(data);

    return SuccessResponse(res, { plan, message: 'تم إنشاء الخطة بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL PLANS
// ═══════════════════════════════════════════════════════════════

export const getPlans = async (req: Request, res: Response) => {
    const { status } = req.body;

    const query: any = {};
    if (status) query.status = status;

    const plans = await SubscriptionPlan.find(query).sort({ sortOrder: 1 });

    return SuccessResponse(res, { plans });
};

// ═══════════════════════════════════════════════════════════════
// 📄 GET SINGLE PLAN
// ═══════════════════════════════════════════════════════════════

export const getPlan = async (req: Request, res: Response) => {
    const { planId } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) throw new NotFound('الخطة غير موجودة');

    return SuccessResponse(res, { plan });
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PLAN
// ═══════════════════════════════════════════════════════════════

export const updatePlan = async (req: Request, res: Response) => {
    const { planId, ...data } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) throw new NotFound('الخطة غير موجودة');

    Object.assign(plan, data);
    await plan.save();

    return SuccessResponse(res, { plan, message: 'تم تحديث الخطة بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE PLAN
// ═══════════════════════════════════════════════════════════════

export const deletePlan = async (req: Request, res: Response) => {
    const { planId } = req.body;

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) throw new NotFound('الخطة غير موجودة');

    plan.status = 'inactive';
    await plan.save();

    return SuccessResponse(res, { message: 'تم إلغاء تفعيل الخطة' });
};
