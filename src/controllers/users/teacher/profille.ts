import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Teacher from "../../../models/schema/admin/Teacher";
import { NotFound } from "../../../Errors/NotFound";
import { SuccessResponse } from "../../../utils/response";
import { BadRequest } from "../../../Errors/BadRequest";
import { UnauthorizedError } from "../../../Errors";
import { saveBase64Image } from "../../../utils/handleImages";

// ═══════════════════════════════════════════════════════════════
// 👤 GET PROFILE
// ═══════════════════════════════════════════════════════════════

export const getProfile = async (req: Request, res: Response) => {
    const teacherId = req.user?.id;

    const teacher = await Teacher.findById(teacherId)
        .select("-password")
        .populate("school", "name nameEn logo")
        .populate("subjects", "name nameEn");

    if (!teacher) {
        throw new NotFound("المعلم غير موجود");
    }

    return SuccessResponse(res, { teacher });
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PROFILE
// ═══════════════════════════════════════════════════════════════

export const updateProfile = async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const { name, email, gender, dateOfBirth, address, avatar } = req.body;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
        throw new NotFound("المعلم غير موجود");
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (address !== undefined) updateData.address = address;

    // Handle avatar
    if (avatar && avatar.startsWith("data:image")) {
        updateData.avatar = await saveBase64Image(
            avatar,
            teacherId || '',
            req,
            "teachers"
        );
    } else if (avatar) {
        updateData.avatar = avatar;
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
        teacherId,
        { $set: updateData },
        { new: true }
    )
        .select("-password")
        .populate("school", "name nameEn logo")
        .populate("subjects", "name nameEn");

    return SuccessResponse(res, {
        teacher: updatedTeacher,
        message: "تم تحديث الملف الشخصي بنجاح",
    });
};

// ═══════════════════════════════════════════════════════════════
// 🔐 CHANGE PASSWORD
// ═══════════════════════════════════════════════════════════════

export const changePassword = async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new BadRequest("كلمة المرور الحالية والجديدة مطلوبة");
    }

    const teacher = await Teacher.findById(teacherId).select("+password");
    if (!teacher) {
        throw new NotFound("المعلم غير موجود");
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, teacher.password);
    if (!isMatch) {
        throw new UnauthorizedError("كلمة المرور الحالية غير صحيحة");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Teacher.findByIdAndUpdate(teacherId, {
        password: hashedPassword,
    });

    return SuccessResponse(res, { message: "تم تغيير كلمة المرور بنجاح" });
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE ACCOUNT
// ═══════════════════════════════════════════════════════════════

export const deleteAccount = async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const { password } = req.body;

    if (!password) {
        throw new BadRequest("كلمة المرور مطلوبة لحذف الحساب");
    }

    const teacher = await Teacher.findById(teacherId).select("+password");
    if (!teacher) {
        throw new NotFound("المعلم غير موجود");
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
        throw new UnauthorizedError("كلمة المرور غير صحيحة");
    }

    await Teacher.findByIdAndDelete(teacherId);

    return SuccessResponse(res, { message: "تم حذف الحساب بنجاح" });
};

// ═══════════════════════════════════════════════════════════════
// 📱 UPDATE FCM TOKEN
// ═══════════════════════════════════════════════════════════════

export const updateFcmToken = async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
        throw new BadRequest("FCM Token مطلوب");
    }

    await Teacher.findByIdAndUpdate(teacherId, { fcmToken });

    return SuccessResponse(res, { message: "تم تحديث FCM Token بنجاح" });
};
