import { Router } from "express";
import {
    getAllSchoolAdmins,
    getOneSchoolAdmin,
    createSchoolAdmin,
    updateSchoolAdmin,
    removeSchoolAdmin,
    select,
    getPermissions,
    getAvailableModules,
} from "../../controllers/admin/schoolAdmin";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

// Static routes first
router.get("/", catchAsync(getAllSchoolAdmins));
router.get("/select", catchAsync(select));
router.post("/",  catchAsync(createSchoolAdmin));

// Dynamic routes
// router.get("/:id", catchAsync(getOneSchoolAdmin));
router.get("/:id/permissions", catchAsync(getPermissions));
router.put("/:id", catchAsync(updateSchoolAdmin));
router.delete("/:id", catchAsync(removeSchoolAdmin));

export default router;
