"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schoolAdmin_1 = require("../../controllers/admin/schoolAdmin");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// Static routes first
router.get("/", (0, catchAsync_1.catchAsync)(schoolAdmin_1.getAllSchoolAdmins));
router.get("/select", (0, catchAsync_1.catchAsync)(schoolAdmin_1.select));
router.post("/", (0, catchAsync_1.catchAsync)(schoolAdmin_1.createSchoolAdmin));
// Dynamic routes
// router.get("/:id", catchAsync(getOneSchoolAdmin));
router.get("/:id/permissions", (0, catchAsync_1.catchAsync)(schoolAdmin_1.getPermissions));
router.put("/:id", (0, catchAsync_1.catchAsync)(schoolAdmin_1.updateSchoolAdmin));
router.delete("/:id", (0, catchAsync_1.catchAsync)(schoolAdmin_1.removeSchoolAdmin));
exports.default = router;
