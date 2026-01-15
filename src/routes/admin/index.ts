import express from "express";
import teacherRouter from "./teatcher";
import authRouter from "./auth"
import profileRouter from "./profile"
import gradeRouter from "./grade"
import classRouter from "./class"
import parentRouter from "./parent"
import subjectRouter from "./subject"
import studentRouter from "./student"
import { authenticated } from "../../middlewares/authenticated"
import { authorizeRoles } from "../../middlewares/authorized"

const router = express.Router();

router.use("/auth", authRouter)
router.use(authenticated, authorizeRoles("admin", "organizer"))
router.use("/teacher", teacherRouter)
router.use("/profile", profileRouter)
router.use("/grade", gradeRouter)
router.use("/class", classRouter)
router.use("/parent", parentRouter)
router.use("/subject", subjectRouter)
router.use("/student", studentRouter)

export default router