"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schoolAdminRoles_1 = require("../../controllers/admin/schoolAdminRoles");
const validation_1 = require("../../middlewares/validation");
const schoolAdminRoles_2 = require("../../validation/admin/schoolAdminRoles");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
// Static routes first
router.get("/", (0, catchAsync_1.catchAsync)(schoolAdminRoles_1.getAllRoles));
router.get("/modules", (0, catchAsync_1.catchAsync)(schoolAdminRoles_1.getAvailableModules));
router.post("/", (0, validation_1.validate)(schoolAdminRoles_2.createRoleSchema), (0, catchAsync_1.catchAsync)(schoolAdminRoles_1.createRole));
// Dynamic routes
router.get("/:id", (0, catchAsync_1.catchAsync)(schoolAdminRoles_1.getOneRole));
router.put("/:id", (0, validation_1.validate)(schoolAdminRoles_2.updateRoleSchema), (0, catchAsync_1.catchAsync)(schoolAdminRoles_1.updateRole));
router.delete("/:id", (0, catchAsync_1.catchAsync)(schoolAdminRoles_1.removeRole));
exports.default = router;
