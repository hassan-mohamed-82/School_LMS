import { Router } from "express";
import {
    createSchedule,
    getAllSchedules,
    getOneSchedule,
    updateSchedule,
    removeSchedule,
    select,
    getByClass
} from "../../controllers/admin/Schedule";
import { validate } from "../../middlewares/validation";
import { createScheduleSchema, updateScheduleSchema } from "../../validation/admin/schedule";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

// ✅ الـ Static routes أولاً
router.get("/", catchAsync(getAllSchedules));
router.get("/select", catchAsync(select));
router.post("/by-class", catchAsync(getByClass));
router.post("/", validate(createScheduleSchema), catchAsync(createSchedule));

// ✅ الـ Dynamic routes (:id) في الآخر
router.get("/:id", catchAsync(getOneSchedule));
router.put("/:id", validate(updateScheduleSchema), catchAsync(updateSchedule));
router.delete("/:id", catchAsync(removeSchedule));

export default router;
