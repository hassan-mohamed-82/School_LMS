"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catchAsync_1 = require("../../utils/catchAsync");
const session_1 = require("../../controllers/admin/session");
const router = (0, express_1.Router)();
// ═══════════════════════════════════════════════════════════════
// 📊 ATTENDANCE
// ═══════════════════════════════════════════════════════════════
router.post('/attendance/class', (0, catchAsync_1.catchAsync)(session_1.getClassAttendanceByDate));
router.post('/attendance/class/report', (0, catchAsync_1.catchAsync)(session_1.getClassAttendanceReport));
router.post('/attendance/student', (0, catchAsync_1.catchAsync)(session_1.getStudentAttendanceHistory));
// ═══════════════════════════════════════════════════════════════
// 📋 SESSIONS
// ═══════════════════════════════════════════════════════════════
router.get('/today', (0, catchAsync_1.catchAsync)(session_1.getTodaySessionsOverview));
router.post('/teacher', (0, catchAsync_1.catchAsync)(session_1.getTeacherSessions));
router.post('/details', (0, catchAsync_1.catchAsync)(session_1.getSessionDetails));
exports.default = router;
