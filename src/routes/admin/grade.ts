import { Router } from "express";
import {
    createGrade,
    getAllGrades,
    getOneGrade,
    updateGrade,
    removeGrade
} from "../../controllers/admin/Grade";
import { validate } from "../../middlewares/validation";
import { createGradeSchema, updateGradeSchema } from "../../validation/admin/grade";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.get("/", catchAsync(getAllGrades));
router.get("/:id", catchAsync(getOneGrade));
router.post("/", validate(createGradeSchema), catchAsync(createGrade));
router.put("/:id", validate(updateGradeSchema), catchAsync(updateGrade));
router.delete("/:id", catchAsync(removeGrade));

export default router;
