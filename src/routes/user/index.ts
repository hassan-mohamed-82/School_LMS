import { Router } from "express";
import teacherAuth from "./teacher/auth";
import teacherProfile from "./teacher/profile";
import teacherSchedule from "./teacher/schedule";
import sessionteacheRouter from './teacher/session'
import { authorizeRoles } from "../../middlewares/authorized";
import { authenticated } from "../../middlewares/authenticated";

const router = Router();

// Public routes (no auth needed)
router.use("/auth", teacherAuth);

// Protected routes (auth needed)
router.use(authenticated);
router.use(authorizeRoles("teacher", "parent"));

// Teacher routes
router.use("/profile", teacherProfile);
router.use("/schedule", teacherSchedule);
router.use("/session",sessionteacheRouter)

export default router;
