import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import SchoolAdmin from "../../models/schema/admin/SchoolAdmin";
import "../../models/schema/superadmin/school"; // Register School schema for populate
import { generateOrganizerToken, generateAdminToken } from "../../utils/auth";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { UnauthorizedError } from "../../Errors";

// ═══════════════════════════════════════════════════════════════
// 🔐 LOGIN
// ═══════════════════════════════════════════════════════════════


export const login = async (req: Request, res: Response) => {
    const { email, phone, password } = req.body;

    // ✅ Validation
    if (!password) {
        throw new BadRequest("كلمة المرور مطلوبة");
    }

    if (!email && !phone) {
        throw new BadRequest("البريد الإلكتروني أو رقم الهاتف مطلوب");
    }

    // ✅ Build query (email or phone)
    const query = email
        ? { email: email.toLowerCase() }
        : { phone: phone };

    // ✅ Find admin with password
    const admin = await SchoolAdmin.findOne(query)
        .select("+password")
        .populate("school", "name nameEn logo status")
        .populate("role", "name permissions");

    if (!admin) {
        throw new NotFound(email ? "البريد الإلكتروني غير مسجل" : "رقم الهاتف غير مسجل");
    }

    // ✅ Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        throw new UnauthorizedError("كلمة المرور غير صحيحة");
    }

    // ✅ Check admin status
    if (admin.status === "inactive") {
        throw new UnauthorizedError("الحساب غير مفعل. تواصل مع الإدارة");
    }

    // ✅ Check school exists and status
    const school = admin.school as any;
    if (!school) {
        throw new NotFound("المدرسة غير موجودة");
    }

    if (school.status === "inactive") {
        throw new UnauthorizedError("المدرسة غير مفعلة. تواصل مع الإدارة");
    }

    if (school.status === "suspended") {
        throw new UnauthorizedError("تم إيقاف المدرسة. تواصل مع الإدارة");
    }

    // ✅ Generate token based on type
    let token: string;

    if (admin.type === "organizer") {
        token = generateOrganizerToken({
            id: admin._id.toString(),
            name: admin.name,
            schoolId: school._id.toString(),
        });
    } else {
        token = generateAdminToken({
            id: admin._id.toString(),
            name: admin.name,
            schoolId: school._id.toString(),
            roleId: admin.role?._id?.toString(),
        });
    }

    // ✅ Update last login
    await SchoolAdmin.findByIdAndUpdate(admin._id, {
        lastLoginAt: new Date(),
    });

    // ✅ Prepare response
    const adminResponse: any = {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        type: admin.type,
        avatar: admin.avatar,
        school: {
            id: school._id,
            name: school.name,
            nameEn: school.nameEn,
            logo: school.logo,
        },
    };

    // ✅ Add role & permissions for admin type
    if (admin.type === "admin" && admin.role) {
        const role = admin.role as any;
        adminResponse.role = {
            id: role._id,
            name: role.name,
        };
        adminResponse.permissions = role.permissions || [];
    }

    return SuccessResponse(
        res,
        {
            message: "تم تسجيل الدخول بنجاح",
            token,
            admin: adminResponse,
        },
        200
    );
};
