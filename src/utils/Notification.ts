import { messaging } from './firebase';
import Teacher from '../models/schema/admin/Teacher';
import Parent from '../models/schema/admin/Parent';

// ═══════════════════════════════════════════════════════════════
// 📤 SEND NOTIFICATION
// ═══════════════════════════════════════════════════════════════

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export const sendNotification = async (
    fcmToken: string,
    payload: NotificationPayload
): Promise<boolean> => {
    try {
        if (!fcmToken) return false;

        await messaging.send({
            token: fcmToken,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'default',
                },
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1,
                    },
                },
            },
        });

        console.log(`✅ Notification sent to: ${fcmToken.substring(0, 20)}...`);
        return true;
    } catch (error: any) {
        console.error(`❌ Notification failed: ${error.message}`);
        return false;
    }
};

// ═══════════════════════════════════════════════════════════════
// 📤 SEND TO MULTIPLE TOKENS
// ═══════════════════════════════════════════════════════════════

export const sendMultipleNotifications = async (
    fcmTokens: string[],
    payload: NotificationPayload
): Promise<{ success: number; failed: number }> => {
    const validTokens = fcmTokens.filter(token => token);
    
    if (validTokens.length === 0) {
        return { success: 0, failed: 0 };
    }

    try {
        const response = await messaging.sendEachForMulticast({
            tokens: validTokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                },
            },
        });

        console.log(`✅ Notifications: ${response.successCount} sent, ${response.failureCount} failed`);
        
        return {
            success: response.successCount,
            failed: response.failureCount,
        };
    } catch (error: any) {
        console.error(`❌ Multicast failed: ${error.message}`);
        return { success: 0, failed: validTokens.length };
    }
};

// ═══════════════════════════════════════════════════════════════
// 👨‍🏫 SEND TO TEACHER
// ═══════════════════════════════════════════════════════════════

export const sendToTeacher = async (
    teacherId: string,
    payload: NotificationPayload
): Promise<boolean> => {
    const teacher = await Teacher.findById(teacherId).select('fcmToken');
    if (!teacher?.fcmToken) return false;
    
    return sendNotification(teacher.fcmToken, payload);
};

// ═══════════════════════════════════════════════════════════════
// 👨‍👩‍👧 SEND TO PARENT
// ═══════════════════════════════════════════════════════════════

export const sendToParent = async (
    parentId: string,
    payload: NotificationPayload
): Promise<boolean> => {
    const parent = await Parent.findById(parentId).select('fcmToken');
    if (!parent?.fcmToken) return false;
    
    return sendNotification(parent.fcmToken, payload);
};
