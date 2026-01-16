"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Schedule_1 = require("../../controllers/admin/Schedule");
const validation_1 = require("../../middlewares/validation");
const schedule_1 = require("../../validation/admin/schedule");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// ✅ الـ Static routes أولاً
router.get("/", (0, catchAsync_1.catchAsync)(Schedule_1.getAllSchedules));
router.get("/select", (0, catchAsync_1.catchAsync)(Schedule_1.select));
router.post("/by-class", (0, catchAsync_1.catchAsync)(Schedule_1.getByClass));
router.post("/", (0, validation_1.validate)(schedule_1.createScheduleSchema), (0, catchAsync_1.catchAsync)(Schedule_1.createSchedule));
// ✅ الـ Dynamic routes (:id) في الآخر
router.get("/:id", (0, catchAsync_1.catchAsync)(Schedule_1.getOneSchedule));
router.put("/:id", (0, validation_1.validate)(schedule_1.updateScheduleSchema), (0, catchAsync_1.catchAsync)(Schedule_1.updateSchedule));
router.delete("/:id", (0, catchAsync_1.catchAsync)(Schedule_1.removeSchedule));
exports.default = router;
