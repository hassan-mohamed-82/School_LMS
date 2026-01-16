import { Router } from "express";
import {
    createStudentGrade,
    getAllStudentGrades,
    getOneStudentGrade,
    updateStudentGrade,
    removeStudentGrade,
    select,
    getByStudent
} from "../../controllers/admin/StudentGrade";
import { validate } from "../../middlewares/validation";
import { createStudentGradeSchema, updateStudentGradeSchema } from "../../validation/admin/studentGrade";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

// ✅ Static routes أولاً
router.get("/", catchAsync(getAllStudentGrades));
router.get("/select", catchAsync(select));
router.post("/by-student", catchAsync(getByStudent));
router.post("/", validate(createStudentGradeSchema), catchAsync(createStudentGrade));

// ✅ Dynamic routes (:id) في الآخر
router.get("/:id", catchAsync(getOneStudentGrade));
router.put("/:id", validate(updateStudentGradeSchema), catchAsync(updateStudentGrade));
router.delete("/:id", catchAsync(removeStudentGrade));

export default router;
