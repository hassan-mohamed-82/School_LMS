import { Router } from "express";
import { catchAsync } from "../../../utils/catchAsync";
import { validate } from "../../../middlewares/validation";
import {
    startSession,
    getMyActiveSession,
    recordAttendance,
    endSession,
    cancelSession,
    uploadHomework,
    getMySessionsHistory,
    getMyClasses,
} from "../../../controllers/users/teacher/session";
import {
    startSessionSchema,
    recordAttendanceSchema,
    endSessionSchema,
    uploadHomeworkSchema,
} from "../../../validation/users/teacher/session";

const router = Router();

// ═══════════════════════════════════════════════════════════════
// 🎯 SESSION APIs
// ═══════════════════════════════════════════════════════════════

// الحصة المفتوحة
router.get('/', catchAsync(getMyActiveSession));

// بدء حصة (يحتاج scheduleId فقط)
router.post('/start', validate(startSessionSchema), catchAsync(startSession));

// تسجيل الحضور (بدون sessionId)
router.post('/attendance', validate(recordAttendanceSchema), catchAsync(recordAttendance));

// رفع واجب (بدون IDs)
router.post('/homework', validate(uploadHomeworkSchema), catchAsync(uploadHomework));

// إنهاء الحصة (بدون sessionId)
router.post('/end', validate(endSessionSchema), catchAsync(endSession));

// إلغاء الحصة (بدون sessionId)
router.post('/cancel', catchAsync(cancelSession));

// ═══════════════════════════════════════════════════════════════
// 📜 OTHER APIs
// ═══════════════════════════════════════════════════════════════

// سجل الحصص
router.get('/history', catchAsync(getMySessionsHistory));

// فصولي
router.get('/classes', catchAsync(getMyClasses));

export default router;
