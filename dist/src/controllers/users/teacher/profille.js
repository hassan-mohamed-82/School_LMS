"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFcmToken = exports.deleteAccount = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Teacher_1 = __importDefault(require("../../../models/schema/admin/Teacher"));
const NotFound_1 = require("../../../Errors/NotFound");
const response_1 = require("../../../utils/response");
const BadRequest_1 = require("../../../Errors/BadRequest");
const Errors_1 = require("../../../Errors");
const handleImages_1 = require("../../../utils/handleImages");
// ═══════════════════════════════════════════════════════════════
// 👤 GET PROFILE
// ═══════════════════════════════════════════════════════════════
const getProfile = async (req, res) => {
    const teacherId = req.user?.id;
    const teacher = await Teacher_1.default.findById(teacherId)
        .select("-password")
        .populate("school", "name nameEn logo")
        .populate("subjects", "name nameEn");
    if (!teacher) {
        throw new NotFound_1.NotFound("المعلم غير موجود");
    }
    return (0, response_1.SuccessResponse)(res, { teacher });
};
exports.getProfile = getProfile;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PROFILE
// ═══════════════════════════════════════════════════════════════
const updateProfile = async (req, res) => {
    const teacherId = req.user?.id;
    const { name, email, gender, dateOfBirth, address, avatar } = req.body;
    const teacher = await Teacher_1.default.findById(teacherId);
    if (!teacher) {
        throw new NotFound_1.NotFound("المعلم غير موجود");
    }
    // Prepare update data
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (email !== undefined)
        updateData.email = email;
    if (gender !== undefined)
        updateData.gender = gender;
    if (dateOfBirth !== undefined)
        updateData.dateOfBirth = dateOfBirth;
    if (address !== undefined)
        updateData.address = address;
    // Handle avatar
    if (avatar && avatar.startsWith("data:image")) {
        updateData.avatar = await (0, handleImages_1.saveBase64Image)(avatar, teacherId || '', req, "teachers");
    }
    else if (avatar) {
        updateData.avatar = avatar;
    }
    const updatedTeacher = await Teacher_1.default.findByIdAndUpdate(teacherId, { $set: updateData }, { new: true })
        .select("-password")
        .populate("school", "name nameEn logo")
        .populate("subjects", "name nameEn");
    return (0, response_1.SuccessResponse)(res, {
        teacher: updatedTeacher,
        message: "تم تحديث الملف الشخصي بنجاح",
    });
};
exports.updateProfile = updateProfile;
// ═══════════════════════════════════════════════════════════════
// 🔐 CHANGE PASSWORD
// ═══════════════════════════════════════════════════════════════
const changePassword = async (req, res) => {
    const teacherId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new BadRequest_1.BadRequest("كلمة المرور الحالية والجديدة مطلوبة");
    }
    const teacher = await Teacher_1.default.findById(teacherId).select("+password");
    if (!teacher) {
        throw new NotFound_1.NotFound("المعلم غير موجود");
    }
    // Verify current password
    const isMatch = await bcryptjs_1.default.compare(currentPassword, teacher.password);
    if (!isMatch) {
        throw new Errors_1.UnauthorizedError("كلمة المرور الحالية غير صحيحة");
    }
    // Hash new password
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    await Teacher_1.default.findByIdAndUpdate(teacherId, {
        password: hashedPassword,
    });
    return (0, response_1.SuccessResponse)(res, { message: "تم تغيير كلمة المرور بنجاح" });
};
exports.changePassword = changePassword;
// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE ACCOUNT
// ═══════════════════════════════════════════════════════════════
const deleteAccount = async (req, res) => {
    const teacherId = req.user?.id;
    const { password } = req.body;
    if (!password) {
        throw new BadRequest_1.BadRequest("كلمة المرور مطلوبة لحذف الحساب");
    }
    const teacher = await Teacher_1.default.findById(teacherId).select("+password");
    if (!teacher) {
        throw new NotFound_1.NotFound("المعلم غير موجود");
    }
    // Verify password
    const isMatch = await bcryptjs_1.default.compare(password, teacher.password);
    if (!isMatch) {
        throw new Errors_1.UnauthorizedError("كلمة المرور غير صحيحة");
    }
    await Teacher_1.default.findByIdAndDelete(teacherId);
    return (0, response_1.SuccessResponse)(res, { message: "تم حذف الحساب بنجاح" });
};
exports.deleteAccount = deleteAccount;
// ═══════════════════════════════════════════════════════════════
// 📱 UPDATE FCM TOKEN
// ═══════════════════════════════════════════════════════════════
const updateFcmToken = async (req, res) => {
    const teacherId = req.user?.id;
    const { fcmToken } = req.body;
    if (!fcmToken) {
        throw new BadRequest_1.BadRequest("FCM Token مطلوب");
    }
    await Teacher_1.default.findByIdAndUpdate(teacherId, { fcmToken });
    return (0, response_1.SuccessResponse)(res, { message: "تم تحديث FCM Token بنجاح" });
};
exports.updateFcmToken = updateFcmToken;
