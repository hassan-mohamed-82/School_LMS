"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_1 = require("../../../controllers/users/teacher/schedule");
const catchAsync_1 = require("../../../utils/catchAsync");
const router = (0, express_1.Router)();
// Get full weekly schedule
router.get("/", (0, catchAsync_1.catchAsync)(schedule_1.getMySchedule));
// Get today's schedule (sorted by time)
router.get("/today", (0, catchAsync_1.catchAsync)(schedule_1.getTodaySchedule));
exports.default = router;
