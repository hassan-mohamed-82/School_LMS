import { Router } from "express";
import {
    createStudent,
    getAllStudents,
    getOneStudent,
    updateStudent,
    removeStudent,
    select,
    searchByParentPhone
} from "../../controllers/admin/student";
import { validate } from "../../middlewares/validation";
import { createStudentSchema, updateStudentSchema } from "../../validation/admin/student";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.get("/", catchAsync(getAllStudents));
router.get("/select", catchAsync(select));
router.get("/search", catchAsync(searchByParentPhone));
router.get("/:id", catchAsync(getOneStudent));
router.post("/", validate(createStudentSchema), catchAsync(createStudent));
router.put("/:id", validate(updateStudentSchema), catchAsync(updateStudent));
router.delete("/:id", catchAsync(removeStudent));

export default router;
