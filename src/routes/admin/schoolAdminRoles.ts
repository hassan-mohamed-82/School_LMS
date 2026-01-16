import { Router } from "express";
import {
    getAllRoles,
    getOneRole,
    createRole,
    updateRole,
    removeRole,
    getAvailableModules,
    getAdminsByRole,
} from "../../controllers/admin/schoolAdminRoles";
import { validate } from "../../middlewares/validation";
import { createRoleSchema, updateRoleSchema } from "../../validation/admin/schoolAdminRoles";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

// Static routes first
router.get("/", catchAsync(getAllRoles));
router.get("/modules", catchAsync(getAvailableModules));
router.post("/", validate(createRoleSchema), catchAsync(createRole));

// Dynamic routes
router.get("/:id", catchAsync(getOneRole));
router.put("/:id", validate(updateRoleSchema), catchAsync(updateRole));
router.delete("/:id", catchAsync(removeRole));

export default router;