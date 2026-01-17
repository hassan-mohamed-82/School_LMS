import { Router } from "express";
import {
    getMySchedule,
    getTodaySchedule,
} from "../../../controllers/users/teacher/schedule";
import { catchAsync } from "../../../utils/catchAsync";

const router = Router();

// Get full weekly schedule
router.get("/", catchAsync(getMySchedule));

// Get today's schedule (sorted by time)
router.get("/today", catchAsync(getTodaySchedule));


export default router;
