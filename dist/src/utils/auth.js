"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.verifyToken = exports.generateToken = exports.generateParentToken = exports.generateTeacherToken = exports.generateAdminToken = exports.generateOrganizerToken = exports.generateSubAdminToken = exports.generateSuperAdminToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Errors_1 = require("../Errors");
require("dotenv/config");
const JWT_SECRET = process.env.JWT_SECRET;
// ═══════════════════════════════════════════════════════════════
// 🔐 SUPER ADMIN TOKENS (System Level)
// ═══════════════════════════════════════════════════════════════
// للـ SuperAdmin (المدير العام للنظام)
const generateSuperAdminToken = (data) => {
    const payload = {
        id: data.id,
        name: data.name,
        role: "superadmin",
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
exports.generateSuperAdminToken = generateSuperAdminToken;
// للـ SubAdmin (مدير فرعي بصلاحيات محدودة)
const generateSubAdminToken = (data) => {
    const payload = {
        id: data.id,
        name: data.name,
        role: "subadmin",
        roleId: data.roleId,
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
exports.generateSubAdminToken = generateSubAdminToken;
// ═══════════════════════════════════════════════════════════════
// 🏫 SCHOOL ADMIN TOKENS (School Level)
// ═══════════════════════════════════════════════════════════════
// للـ Organizer (صاحب المدرسة)
const generateOrganizerToken = (data) => {
    const payload = {
        id: data.id,
        name: data.name,
        role: "organizer",
        schoolId: data.schoolId,
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
exports.generateOrganizerToken = generateOrganizerToken;
// للـ Admin (مدير بالمدرسة بصلاحيات)
const generateAdminToken = (data) => {
    const payload = {
        id: data.id,
        name: data.name,
        role: "admin",
        schoolId: data.schoolId,
        roleId: data.roleId,
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
exports.generateAdminToken = generateAdminToken;
// ═══════════════════════════════════════════════════════════════
// 👨‍🏫 TEACHER TOKEN (School Level)
// ═══════════════════════════════════════════════════════════════
// للـ Teacher (المدرس)
const generateTeacherToken = (data) => {
    const payload = {
        id: data.id,
        name: data.name,
        role: "teacher",
        schoolId: data.schoolId,
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};
exports.generateTeacherToken = generateTeacherToken;
// ═══════════════════════════════════════════════════════════════
// 👨‍👩‍👧 PARENT TOKEN (Mobile App)
// ═══════════════════════════════════════════════════════════════
// للـ Parent (ولي الأمر)
const generateParentToken = (data) => {
    const payload = {
        id: data.id,
        name: data.name,
        role: "parent",
        schoolId: data.schoolId,
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "30d" }); // مدة أطول للموبايل
};
exports.generateParentToken = generateParentToken;
const generateToken = (data) => {
    const payload = {
        id: data.id,
        name: data.name,
        role: data.role,
        ...(data.schoolId && { schoolId: data.schoolId }),
        ...(data.roleId && { roleId: data.roleId }),
    };
    // مدة التوكن حسب الدور
    const expiresIn = data.role === "parent" ? "30d" : "7d";
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
};
exports.generateToken = generateToken;
// ═══════════════════════════════════════════════════════════════
// ✅ VERIFY TOKEN
// ═══════════════════════════════════════════════════════════════
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        throw new Errors_1.UnauthorizedError("Invalid or expired token");
    }
};
exports.verifyToken = verifyToken;
// ═══════════════════════════════════════════════════════════════
// 🔄 REFRESH TOKEN (Optional)
// ═══════════════════════════════════════════════════════════════
const refreshToken = (oldToken) => {
    const decoded = (0, exports.verifyToken)(oldToken);
    // إزالة الـ iat و exp من الـ payload القديم
    const { iat, exp, ...payload } = decoded;
    const expiresIn = payload.role === "parent" ? "30d" : "7d";
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
};
exports.refreshToken = refreshToken;
