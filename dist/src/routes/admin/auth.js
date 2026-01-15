"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../controllers/admin/auth");
const catchAsync_1 = require("../../utils/catchAsync");
const router = (0, express_1.Router)();
router.post("/login", (0, catchAsync_1.catchAsync)(auth_1.login));
exports.default = router;
