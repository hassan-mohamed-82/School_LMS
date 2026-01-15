import { Router } from "express";
import {
    createParent,
    getAllParents,
    getOneParent,
    updateParent,
    removeParent
} from "../../controllers/admin/parent";
import { validate } from "../../middlewares/validation";
import { createParentSchema, updateParentSchema } from "../../validation/admin/parent";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.get("/", catchAsync(getAllParents));
router.get("/:id", catchAsync(getOneParent));
router.post("/", validate(createParentSchema), catchAsync(createParent));
router.put("/:id", validate(updateParentSchema), catchAsync(updateParent));
router.delete("/:id", catchAsync(removeParent));

export default router;
