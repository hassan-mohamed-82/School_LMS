import { Router } from "express";
import {
    createClass,
    getAllClasses,
    getOneClass,
    updateClass,
    removeClass
} from "../../controllers/admin/Class";
import { validate } from "../../middlewares/validation";
import { createClassSchema, updateClassSchema } from "../../validation/admin/class";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.get("/", catchAsync(getAllClasses));
router.get("/:id", catchAsync(getOneClass));
router.post("/", validate(createClassSchema), catchAsync(createClass));
router.put("/:id", validate(updateClassSchema), catchAsync(updateClass));
router.delete("/:id", catchAsync(removeClass));

export default router;
