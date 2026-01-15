"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SchoolAdmin_1 = __importDefault(require("../../models/schema/admin/SchoolAdmin"));
require("../../models/schema/superadmin/school"); // Register School schema for populate
const auth_1 = require("../../utils/auth");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const NotFound_1 = require("../../Errors/NotFound");
const Errors_1 = require("../../Errors");
// ═══════════════════════════════════════════════════════════════
// 🔐 LOGIN
// ═══════════════════════════════════════════════════════════════
const login = async (req, res) => {
    const { email, phone, password } = req.body;
    // ✅ Validation
    if (!password) {
        throw new BadRequest_1.BadRequest("كلمة المرور مطلوبة");
    }
    if (!email && !phone) {
        throw new BadRequest_1.BadRequest("البريد الإلكتروني أو رقم الهاتف مطلوب");
    }
    // ✅ Build query (email or phone)
    const query = email
        ? { email: email.toLowerCase() }
        : { phone: phone };
    // ✅ Find admin with password
    const admin = await SchoolAdmin_1.default.findOne(query)
        .select("+password")
        .populate("school", "name nameEn logo status")
        .populate("role", "name permissions");
    if (!admin) {
        throw new NotFound_1.NotFound(email ? "البريد الإلكتروني غير مسجل" : "رقم الهاتف غير مسجل");
    }
    // ✅ Check password
    const isMatch = await bcryptjs_1.default.compare(password, admin.password);
    if (!isMatch) {
        throw new Errors_1.UnauthorizedError("كلمة المرور غير صحيحة");
    }
    // ✅ Check admin status
    if (admin.status === "inactive") {
        throw new Errors_1.UnauthorizedError("الحساب غير مفعل. تواصل مع الإدارة");
    }
    // ✅ Check school exists and status
    const school = admin.school;
    if (!school) {
        throw new NotFound_1.NotFound("المدرسة غير موجودة");
    }
    if (school.status === "inactive") {
        throw new Errors_1.UnauthorizedError("المدرسة غير مفعلة. تواصل مع الإدارة");
    }
    if (school.status === "suspended") {
        throw new Errors_1.UnauthorizedError("تم إيقاف المدرسة. تواصل مع الإدارة");
    }
    // ✅ Generate token based on type
    let token;
    if (admin.type === "organizer") {
        token = (0, auth_1.generateOrganizerToken)({
            id: admin._id.toString(),
            name: admin.name,
            schoolId: school._id.toString(),
        });
    }
    else {
        token = (0, auth_1.generateAdminToken)({
            id: admin._id.toString(),
            name: admin.name,
            schoolId: school._id.toString(),
            roleId: admin.role?._id?.toString(),
        });
    }
    // ✅ Update last login
    await SchoolAdmin_1.default.findByIdAndUpdate(admin._id, {
        lastLoginAt: new Date(),
    });
    // ✅ Prepare response
    const adminResponse = {
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
        const role = admin.role;
        adminResponse.role = {
            id: role._id,
            name: role.name,
        };
        adminResponse.permissions = role.permissions || [];
    }
    return (0, response_1.SuccessResponse)(res, {
        message: "تم تسجيل الدخول بنجاح",
        token,
        admin: adminResponse,
    }, 200);
};
exports.login = login;
