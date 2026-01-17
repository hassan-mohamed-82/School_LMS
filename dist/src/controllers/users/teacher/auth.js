"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Teacher_1 = __importDefault(require("../../../models/schema/admin/Teacher"));
require("../../../models/schema/superadmin/school");
const auth_1 = require("../../../utils/auth");
const response_1 = require("../../../utils/response");
const BadRequest_1 = require("../../../Errors/BadRequest");
const NotFound_1 = require("../../../Errors/NotFound");
const Errors_1 = require("../../../Errors");
// ═══════════════════════════════════════════════════════════════
// 🔐 TEACHER LOGIN
// ═══════════════════════════════════════════════════════════════
const login = async (req, res) => {
    const { phone, password } = req.body;
    // ✅ Validation
    if (!password) {
        throw new BadRequest_1.BadRequest("كلمة المرور مطلوبة");
    }
    if (!phone) {
        throw new BadRequest_1.BadRequest("رقم الهاتف مطلوب");
    }
    // ✅ Find teacher with password
    const teacher = await Teacher_1.default.findOne({ phone })
        .select("+password")
        .populate("school", "name nameEn logo status")
        .populate("subjects", "name nameEn");
    if (!teacher) {
        throw new NotFound_1.NotFound("رقم الهاتف غير مسجل");
    }
    // ✅ Check password
    const isMatch = await bcryptjs_1.default.compare(password, teacher.password);
    if (!isMatch) {
        throw new Errors_1.UnauthorizedError("كلمة المرور غير صحيحة");
    }
    // ✅ Check teacher status
    if (teacher.status === "inactive") {
        throw new Errors_1.UnauthorizedError("الحساب غير مفعل. تواصل مع الإدارة");
    }
    // ✅ Check school exists and status
    const school = teacher.school;
    if (!school) {
        throw new NotFound_1.NotFound("المدرسة غير موجودة");
    }
    if (school.status === "inactive") {
        throw new Errors_1.UnauthorizedError("المدرسة غير مفعلة. تواصل مع الإدارة");
    }
    if (school.status === "suspended") {
        throw new Errors_1.UnauthorizedError("تم إيقاف المدرسة. تواصل مع الإدارة");
    }
    // ✅ Generate token
    const token = (0, auth_1.generateTeacherToken)({
        id: teacher._id.toString(),
        name: teacher.name,
        schoolId: school._id.toString(),
    });
    // ✅ Update last login
    await Teacher_1.default.findByIdAndUpdate(teacher._id, {
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
    return (0, response_1.SuccessResponse)(res, {
        message: "تم تسجيل الدخول بنجاح",
        token,
        teacher: teacherResponse,
    }, 200);
};
exports.login = login;
