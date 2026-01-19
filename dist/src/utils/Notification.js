"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToParent = exports.sendToTeacher = exports.sendMultipleNotifications = exports.sendNotification = void 0;
const firebase_1 = require("./firebase");
const Teacher_1 = __importDefault(require("../models/schema/admin/Teacher"));
const Parent_1 = __importDefault(require("../models/schema/admin/Parent"));
const sendNotification = async (fcmToken, payload) => {
    try {
        if (!fcmToken)
            return false;
        await firebase_1.messaging.send({
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
    }
    catch (error) {
        console.error(`❌ Notification failed: ${error.message}`);
        return false;
    }
};
exports.sendNotification = sendNotification;
// ═══════════════════════════════════════════════════════════════
// 📤 SEND TO MULTIPLE TOKENS
// ═══════════════════════════════════════════════════════════════
const sendMultipleNotifications = async (fcmTokens, payload) => {
    const validTokens = fcmTokens.filter(token => token);
    if (validTokens.length === 0) {
        return { success: 0, failed: 0 };
    }
    try {
        const response = await firebase_1.messaging.sendEachForMulticast({
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
    }
    catch (error) {
        console.error(`❌ Multicast failed: ${error.message}`);
        return { success: 0, failed: validTokens.length };
    }
};
exports.sendMultipleNotifications = sendMultipleNotifications;
// ═══════════════════════════════════════════════════════════════
// 👨‍🏫 SEND TO TEACHER
// ═══════════════════════════════════════════════════════════════
const sendToTeacher = async (teacherId, payload) => {
    const teacher = await Teacher_1.default.findById(teacherId).select('fcmToken');
    if (!teacher?.fcmToken)
        return false;
    return (0, exports.sendNotification)(teacher.fcmToken, payload);
};
exports.sendToTeacher = sendToTeacher;
// ═══════════════════════════════════════════════════════════════
// 👨‍👩‍👧 SEND TO PARENT
// ═══════════════════════════════════════════════════════════════
const sendToParent = async (parentId, payload) => {
    const parent = await Parent_1.default.findById(parentId).select('fcmToken');
    if (!parent?.fcmToken)
        return false;
    return (0, exports.sendNotification)(parent.fcmToken, payload);
};
exports.sendToParent = sendToParent;
