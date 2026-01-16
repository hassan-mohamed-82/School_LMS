"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exam_1 = require("../../controllers/admin/exam");
const validation_1 = require("../../middlewares/validation");
const exam_2 = require("../../validation/admin/exam");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// ✅ Static routes أولاً
router.get("/", (0, catchAsync_1.catchAsync)(exam_1.getAllExams));
router.get("/select", (0, catchAsync_1.catchAsync)(exam_1.select));
router.post("/", (0, validation_1.validate)(exam_2.createExamSchema), (0, catchAsync_1.catchAsync)(exam_1.createExam));
// ✅ Dynamic routes (:id) في الآخر
router.get("/:id", (0, catchAsync_1.catchAsync)(exam_1.getOneExam));
router.put("/:id", (0, validation_1.validate)(exam_2.updateExamSchema), (0, catchAsync_1.catchAsync)(exam_1.updateExam));
router.delete("/:id", (0, catchAsync_1.catchAsync)(exam_1.removeExam));
exports.default = router;
