// src/controllers/superadmin/paymentMethod.controller.ts

import { Request, Response } from 'express';
import { NotFound } from '../../Errors/NotFound';
import PaymentMethod from '../../models/schema/superadmin/paymentMethod';
import { SuccessResponse } from '../../utils/response';
import { saveBase64Image } from '../../utils/handleImages';

// ═══════════════════════════════════════════════════════════════
// ➕ CREATE PAYMENT METHOD
// ═══════════════════════════════════════════════════════════════

export const createPaymentMethod = async (req: Request, res: Response) => {
  const { logo, ...data } = req.body;

  let logoPath;
  if (logo) {
    logoPath = await saveBase64Image(logo, `method-${Date.now()}`, req, 'payment-methods');
  }

  const method = await PaymentMethod.create({
    ...data,
    logo: logoPath,
  });

  return SuccessResponse(res, { method, message: 'تم إضافة طريقة الدفع بنجاح' }, 201);
};

// ═══════════════════════════════════════════════════════════════
// 📋 GET ALL PAYMENT METHODS
// ═══════════════════════════════════════════════════════════════

export const getPaymentMethods = async (req: Request, res: Response) => {
  const { status } = req.body;

  const query: any = {};
  if (status) query.status = status;

  const methods = await PaymentMethod.find(query).sort({ sortOrder: 1 });

  return SuccessResponse(res, { methods });
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PAYMENT METHOD
// ═══════════════════════════════════════════════════════════════

export const updatePaymentMethod = async (req: Request, res: Response) => {
  const { methodId, logo, ...data } = req.body;

  const method = await PaymentMethod.findById(methodId);
  if (!method) throw new NotFound('طريقة الدفع غير موجودة');

  if (logo && logo.startsWith('data:')) {
    data.logo = await saveBase64Image(logo, `method-${Date.now()}`, req, 'payment-methods');
  }

  Object.assign(method, data);
  await method.save();

  return SuccessResponse(res, { method, message: 'تم تحديث طريقة الدفع بنجاح' });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE PAYMENT METHOD
// ═══════════════════════════════════════════════════════════════

export const deletePaymentMethod = async (req: Request, res: Response) => {
  const { methodId } = req.body;

  const method = await PaymentMethod.findById(methodId);
  if (!method) throw new NotFound('طريقة الدفع غير موجودة');

  method.status = 'inactive';
  await method.save();

  return SuccessResponse(res, { message: 'تم إلغاء تفعيل طريقة الدفع' });
};
