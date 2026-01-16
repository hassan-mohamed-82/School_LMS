import { Router } from "express";
import {
    createExam,
    getAllExams,
    getOneExam,
    updateExam,
    removeExam,
    select
} from "../../controllers/admin/exam";
import { validate } from "../../middlewares/validation";
import { createExamSchema, updateExamSchema } from "../../validation/admin/exam";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

// ✅ Static routes أولاً
router.get("/", catchAsync(getAllExams));
router.get("/select", catchAsync(select));
router.post("/", validate(createExamSchema), catchAsync(createExam));

// ✅ Dynamic routes (:id) في الآخر
router.get("/:id", catchAsync(getOneExam));
router.put("/:id", validate(updateExamSchema), catchAsync(updateExam));
router.delete("/:id", catchAsync(removeExam));

export default router;
