"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./teacher/auth"));
const profile_1 = __importDefault(require("./teacher/profile"));
const schedule_1 = __importDefault(require("./teacher/schedule"));
const session_1 = __importDefault(require("./teacher/session"));
const authorized_1 = require("../../middlewares/authorized");
const authenticated_1 = require("../../middlewares/authenticated");
const router = (0, express_1.Router)();
// Public routes (no auth needed)
router.use("/auth", auth_1.default);
// Protected routes (auth needed)
router.use(authenticated_1.authenticated);
router.use((0, authorized_1.authorizeRoles)("teacher", "parent"));
// Teacher routes
router.use("/profile", profile_1.default);
router.use("/schedule", schedule_1.default);
router.use("/session", session_1.default);
exports.default = router;
