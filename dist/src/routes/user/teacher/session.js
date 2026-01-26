"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catchAsync_1 = require("../../../utils/catchAsync");
const validation_1 = require("../../../middlewares/validation");
const session_1 = require("../../../controllers/users/teacher/session");
const session_2 = require("../../../validation/users/teacher/session");
const multer_1 = require("../../../utils/multer");
const router = (0, express_1.Router)();
// ═══════════════════════════════════════════════════════════════
// 🎯 SESSION APIs
// ═══════════════════════════════════════════════════════════════
// الحصة المفتوحة
router.get('/', (0, catchAsync_1.catchAsync)(session_1.getMyActiveSession));
// بدء حصة (يحتاج scheduleId فقط)
router.post('/start', (0, validation_1.validate)(session_2.startSessionSchema), (0, catchAsync_1.catchAsync)(session_1.startSession));
// تسجيل الحضور (بدون sessionId)
router.post('/attendance', (0, validation_1.validate)(session_2.recordAttendanceSchema), (0, catchAsync_1.catchAsync)(session_1.recordAttendance));
// رفع واجب (بدون IDs)
router.post('/homework', multer_1.upload.single('file'), (0, validation_1.validate)(session_2.uploadHomeworkSchema), (0, catchAsync_1.catchAsync)(session_1.uploadHomework));
// إنهاء الحصة (بدون sessionId)
router.post('/end', (0, validation_1.validate)(session_2.endSessionSchema), (0, catchAsync_1.catchAsync)(session_1.endSession));
// إلغاء الحصة (بدون sessionId)
router.post('/cancel', (0, catchAsync_1.catchAsync)(session_1.cancelSession));
// ═══════════════════════════════════════════════════════════════
// 📜 OTHER APIs
// ═══════════════════════════════════════════════════════════════
// سجل الحصص
router.get('/history', (0, catchAsync_1.catchAsync)(session_1.getMySessionsHistory));
// فصولي
router.get('/classes', (0, catchAsync_1.catchAsync)(session_1.getMyClasses));
exports.default = router;
