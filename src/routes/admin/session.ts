import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import {
   
    getClassAttendanceByDate,
    getStudentAttendanceHistory,
    getClassAttendanceReport,
    getTeacherSessions,
    getSessionDetails,
    getTodaySessionsOverview,
} from '../../controllers/admin/session';

const router = Router();

// ═══════════════════════════════════════════════════════════════
// 📊 ATTENDANCE
// ═══════════════════════════════════════════════════════════════
router.post('/attendance/class', catchAsync(getClassAttendanceByDate));
router.post('/attendance/class/report', catchAsync(getClassAttendanceReport));
router.post('/attendance/student', catchAsync(getStudentAttendanceHistory));

// ═══════════════════════════════════════════════════════════════
// 📋 SESSIONS
// ═══════════════════════════════════════════════════════════════
router.get('/today', catchAsync(getTodaySessionsOverview));
router.post('/teacher', catchAsync(getTeacherSessions));
router.post('/details', catchAsync(getSessionDetails));

export default router;
