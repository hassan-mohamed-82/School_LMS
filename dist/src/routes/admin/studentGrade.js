"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StudentGrade_1 = require("../../controllers/admin/StudentGrade");
const validation_1 = require("../../middlewares/validation");
const studentGrade_1 = require("../../validation/admin/studentGrade");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// ✅ Static routes أولاً
router.get("/", (0, catchAsync_1.catchAsync)(StudentGrade_1.getAllStudentGrades));
router.get("/select", (0, catchAsync_1.catchAsync)(StudentGrade_1.select));
router.post("/by-student", (0, catchAsync_1.catchAsync)(StudentGrade_1.getByStudent));
router.post("/", (0, validation_1.validate)(studentGrade_1.createStudentGradeSchema), (0, catchAsync_1.catchAsync)(StudentGrade_1.createStudentGrade));
// ✅ Dynamic routes (:id) في الآخر
router.get("/:id", (0, catchAsync_1.catchAsync)(StudentGrade_1.getOneStudentGrade));
router.put("/:id", (0, validation_1.validate)(studentGrade_1.updateStudentGradeSchema), (0, catchAsync_1.catchAsync)(StudentGrade_1.updateStudentGrade));
router.delete("/:id", (0, catchAsync_1.catchAsync)(StudentGrade_1.removeStudentGrade));
exports.default = router;
