import { Router } from "express";
import {
    createSubject,
    getAllSubjects,
    getOneSubject,
    updateSubject,
    removeSubject
} from "../../controllers/admin/subject";
import { validate } from "../../middlewares/validation";
import { createSubjectSchema, updateSubjectSchema } from "../../validation/admin/subject";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.get("/", catchAsync(getAllSubjects));
router.get("/:id", catchAsync(getOneSubject));
router.post("/", validate(createSubjectSchema), catchAsync(createSubject));
router.put("/:id", validate(updateSubjectSchema), catchAsync(updateSubject));
router.delete("/:id", catchAsync(removeSubject));

export default router;
