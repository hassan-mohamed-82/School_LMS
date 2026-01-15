"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const SchoolAdmin_1 = __importDefault(require("../../models/schema/admin/SchoolAdmin"));
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
const getProfile = async (req, res) => {
    const adminId = req.user?.id;
    const admin = await SchoolAdmin_1.default.findById(adminId)
        .select("-password")
        .populate("school", "name nameEn logo email phone address status")
        .populate("role", "name permissions");
    if (!admin) {
        throw new NotFound_1.NotFound("الحساب غير موجود");
    }
    return (0, response_1.SuccessResponse)(res, { admin }, 200);
};
exports.getProfile = getProfile;
// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE PROFILE
// ═══════════════════════════════════════════════════════════════
const updateProfile = async (req, res) => {
    const adminId = req.user?.id;
    const { name, phone, avatar } = req.body;
    const admin = await SchoolAdmin_1.default.findById(adminId);
    if (!admin) {
        throw new NotFound_1.NotFound("الحساب غير موجود");
    }
    // ✅ Prepare update data
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (phone !== undefined)
        updateData.phone = phone;
    // ✅ Handle avatar
    if (avatar !== undefined) {
        if (avatar === null || avatar === "") {
            updateData.avatar = null;
        }
        else if (avatar.startsWith("data:image")) {
            // Save base64 image
            // const { saveBase64Image } = require("../../utils/handleImages");
            // updateData.avatar = await saveBase64Image(avatar, adminId, req, "avatars");
            updateData.avatar = avatar; // أو احفظها كـ base64 مؤقتاً
        }
    }
    const updatedAdmin = await SchoolAdmin_1.default.findByIdAndUpdate(adminId, { $set: updateData }, { new: true })
        .select("-password")
        .populate("school", "name nameEn logo");
    return (0, response_1.SuccessResponse)(res, {
        message: "تم تحديث البيانات بنجاح",
        admin: updatedAdmin,
    }, 200);
};
exports.updateProfile = updateProfile;
