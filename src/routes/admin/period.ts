import { Router } from "express";
import {
    createPeriod,
    getAllPeriods,
    getOnePeriod,
    updatePeriod,
    removePeriod
} from "../../controllers/admin/period";
import { validate } from "../../middlewares/validation";
import { createPeriodSchema, updatePeriodSchema } from "../../validation/admin/period";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.get("/", catchAsync(getAllPeriods));
router.get("/:id", catchAsync(getOnePeriod));
router.post("/", validate(createPeriodSchema), catchAsync(createPeriod));
router.put("/:id", validate(updatePeriodSchema), catchAsync(updatePeriod));
router.delete("/:id", catchAsync(removePeriod));

export default router;
