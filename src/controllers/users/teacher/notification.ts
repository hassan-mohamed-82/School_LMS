import { Request, Response } from 'express';
import Notification from '../../../models/schema/user/notification';
import { SuccessResponse } from '../../../utils/response';
import { NotFound } from '../../../Errors';

// ═══════════════════════════════════════════════════════════════
// 📋 GET MY NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export const getMyNotifications = async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId;
    const { page = 1, limit = 20, isRead } = req.query;

    const query: any = {
        school: schoolId,
        recipient: teacherId,
        recipientModel: 'Teacher',
    };

    if (isRead !== undefined) {
        query.isRead = isRead === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Notification.countDocuments(query),
        Notification.countDocuments({ ...query, isRead: false }),
    ]);

    return SuccessResponse(res, {
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

// ═══════════════════════════════════════════════════════════════
// ✅ MARK AS READ
// ═══════════════════════════════════════════════════════════════

export const markAsRead = async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
        {
            _id: notificationId,
            recipient: teacherId,
        },
        {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        },
        { new: true }
    );

    if (!notification) {
        throw new NotFound('الإشعار غير موجود');
    }

    return SuccessResponse(res, { notification });
};

// ═══════════════════════════════════════════════════════════════
// ✅ MARK ALL AS READ
// ═══════════════════════════════════════════════════════════════

export const markAllAsRead = async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId;

    const result = await Notification.updateMany(
        {
            school: schoolId,
            recipient: teacherId,
            recipientModel: 'Teacher',
            isRead: false,
        },
        {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        }
    );

    return SuccessResponse(res, {
        markedCount: result.modifiedCount,
        message: 'تم قراءة جميع الإشعارات',
    });
};

// ═══════════════════════════════════════════════════════════════
// 🔢 GET UNREAD COUNT
// ═══════════════════════════════════════════════════════════════

export const getUnreadCount = async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId;

    const count = await Notification.countDocuments({
        school: schoolId,
        recipient: teacherId,
        recipientModel: 'Teacher',
        isRead: false,
    });

    return SuccessResponse(res, { unreadCount: count });
};
