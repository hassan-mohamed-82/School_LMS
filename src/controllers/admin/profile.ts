import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import SchoolAdmin from "../../models/schema/admin/SchoolAdmin";
import School from "../../models/schema/superadmin/school";
import { generateOrganizerToken, generateAdminToken } from "../../utils/auth";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { UnauthorizedError } from "../../Errors";

export const getProfile = async (req: Request, res: Response) => {
    const adminId = req.user?.id;

    const admin = await SchoolAdmin.findById(adminId)
        .select("-password")
        .populate("school", "name nameEn logo email phone address status")
        .populate("role", "name permissions");

    if (!admin) {
        throw new NotFound("الحساب غير موجود");
    }

    return SuccessResponse(res, { admin }, 200);
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PROFILE
// ═══════════════════════════════════════════════════════════════

export const updateProfile = async (req: Request, res: Response) => {
    const adminId = req.user?.id;
    const { name, phone, avatar } = req.body;

    const admin = await SchoolAdmin.findById(adminId);

    if (!admin) {
        throw new NotFound("الحساب غير موجود");
    }

    // ✅ Prepare update data
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    // ✅ Handle avatar
    if (avatar !== undefined) {
        if (avatar === null || avatar === "") {
            updateData.avatar = null;
        } else if (avatar.startsWith("data:image")) {
            // Save base64 image
            // const { saveBase64Image } = require("../../utils/handleImages");
            // updateData.avatar = await saveBase64Image(avatar, adminId, req, "avatars");
            updateData.avatar = avatar; // أو احفظها كـ base64 مؤقتاً
        }
    }

    const updatedAdmin = await SchoolAdmin.findByIdAndUpdate(
        adminId,
        { $set: updateData },
        { new: true }
    )
        .select("-password")
        .populate("school", "name nameEn logo");

    return SuccessResponse(
        res,
        {
            message: "تم تحديث البيانات بنجاح",
            admin: updatedAdmin,
        },
        200
    );
};
