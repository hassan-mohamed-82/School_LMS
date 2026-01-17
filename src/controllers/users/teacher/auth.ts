import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import Teacher from "../../../models/schema/admin/Teacher";
import "../../../models/schema/superadmin/school";
import { generateTeacherToken } from "../../../utils/auth";
import { SuccessResponse } from "../../../utils/response";
import { BadRequest } from "../../../Errors/BadRequest";
import { NotFound } from "../../../Errors/NotFound";
import { UnauthorizedError } from "../../../Errors";

// ═══════════════════════════════════════════════════════════════
// 🔐 TEACHER LOGIN
// ═══════════════════════════════════════════════════════════════

export const login = async (req: Request, res: Response) => {
    const { phone, password } = req.body;

    // ✅ Validation
    if (!password) {
        throw new BadRequest("كلمة المرور مطلوبة");
    }

    if (!phone) {
        throw new BadRequest("رقم الهاتف مطلوب");
    }

    // ✅ Find teacher with password
    const teacher = await Teacher.findOne({ phone })
        .select("+password")
        .populate("school", "name nameEn logo status")
        .populate("subjects", "name nameEn");

    if (!teacher) {
        throw new NotFound("رقم الهاتف غير مسجل");
    }

    // ✅ Check password
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
        throw new UnauthorizedError("كلمة المرور غير صحيحة");
    }

    // ✅ Check teacher status
    if (teacher.status === "inactive") {
        throw new UnauthorizedError("الحساب غير مفعل. تواصل مع الإدارة");
    }

    // ✅ Check school exists and status
    const school = teacher.school as any;
    if (!school) {
        throw new NotFound("المدرسة غير موجودة");
    }

    if (school.status === "inactive") {
        throw new UnauthorizedError("المدرسة غير مفعلة. تواصل مع الإدارة");
    }

    if (school.status === "suspended") {
        throw new UnauthorizedError("تم إيقاف المدرسة. تواصل مع الإدارة");
    }

    // ✅ Generate token
    const token = generateTeacherToken({
        id: teacher._id.toString(),
        name: teacher.name,
        schoolId: school._id.toString(),
    });

    // ✅ Update last login
    await Teacher.findByIdAndUpdate(teacher._id, {
        lastLoginAt: new Date(),
    });

    // ✅ Prepare response
    const teacherResponse = {
        id: teacher._id,
        name: teacher.name,
        phone: teacher.phone,
        email: teacher.email,
        gender: teacher.gender,
        avatar: teacher.avatar,
        subjects: teacher.subjects,
        school: {
            id: school._id,
            name: school.name,
            nameEn: school.nameEn,
            logo: school.logo,
        },
    };

    return SuccessResponse(
        res,
        {
            message: "تم تسجيل الدخول بنجاح",
            token,
            teacher: teacherResponse,
        },
        200
    );
};
