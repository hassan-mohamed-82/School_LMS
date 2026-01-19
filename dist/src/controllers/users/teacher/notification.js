"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getMyNotifications = void 0;
const notification_1 = __importDefault(require("../../../models/schema/user/notification"));
const response_1 = require("../../../utils/response");
const Errors_1 = require("../../../Errors");
// ═══════════════════════════════════════════════════════════════
// 📋 GET MY NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
const getMyNotifications = async (req, res) => {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId;
    const { page = 1, limit = 20, isRead } = req.query;
    const query = {
        school: schoolId,
        recipient: teacherId,
        recipientModel: 'Teacher',
    };
    if (isRead !== undefined) {
        query.isRead = isRead === 'true';
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [notifications, total, unreadCount] = await Promise.all([
        notification_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        notification_1.default.countDocuments(query),
        notification_1.default.countDocuments({ ...query, isRead: false }),
    ]);
    return (0, response_1.SuccessResponse)(res, {
        notifications,
        unreadCount,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
    });
};
exports.getMyNotifications = getMyNotifications;
// ═══════════════════════════════════════════════════════════════
// ✅ MARK AS READ
// ═══════════════════════════════════════════════════════════════
const markAsRead = async (req, res) => {
    const teacherId = req.user?.id;
    const { notificationId } = req.params;
    const notification = await notification_1.default.findOneAndUpdate({
        _id: notificationId,
        recipient: teacherId,
    }, {
        $set: {
            isRead: true,
            readAt: new Date(),
        },
    }, { new: true });
    if (!notification) {
        throw new Errors_1.NotFound('الإشعار غير موجود');
    }
    return (0, response_1.SuccessResponse)(res, { notification });
};
exports.markAsRead = markAsRead;
// ═══════════════════════════════════════════════════════════════
// ✅ MARK ALL AS READ
// ═══════════════════════════════════════════════════════════════
const markAllAsRead = async (req, res) => {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId;
    const result = await notification_1.default.updateMany({
        school: schoolId,
        recipient: teacherId,
        recipientModel: 'Teacher',
        isRead: false,
    }, {
        $set: {
            isRead: true,
            readAt: new Date(),
        },
    });
    return (0, response_1.SuccessResponse)(res, {
        markedCount: result.modifiedCount,
        message: 'تم قراءة جميع الإشعارات',
    });
};
exports.markAllAsRead = markAllAsRead;
// ═══════════════════════════════════════════════════════════════
// 🔢 GET UNREAD COUNT
// ═══════════════════════════════════════════════════════════════
const getUnreadCount = async (req, res) => {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId;
    const count = await notification_1.default.countDocuments({
        school: schoolId,
        recipient: teacherId,
        recipientModel: 'Teacher',
        isRead: false,
    });
    return (0, response_1.SuccessResponse)(res, { unreadCount: count });
};
exports.getUnreadCount = getUnreadCount;
