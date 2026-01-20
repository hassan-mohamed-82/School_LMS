import { Router } from "express";
import { createTeacher, getAllTeacher, getOneTeacher, removeTeacher, select, updateTeacher } from "../../controllers/admin/teacher";
import { validate } from "../../middlewares/validation";
import { createTeacherSchema, updateTeacherSchema } from "../../validation/admin/teacher";
import { catchAsync } from "../../utils/catchAsync";
const router = Router();

router.get("/select", catchAsync(select));

router.post("/", validate(createTeacherSchema), catchAsync(createTeacher));
router.get("/", getAllTeacher);
router.get("/:id", getOneTeacher);
router.put("/:id", validate(updateTeacherSchema), updateTeacher);
router.delete("/:id", removeTeacher);

export default router;