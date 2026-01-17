import { Router } from "express";
import {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    updateFcmToken,
} from "../../../controllers/users/teacher/profille";
import { validate } from "../../../middlewares/validation";
import {
    updateProfileSchema,
    changePasswordSchema,
    deleteAccountSchema,
    updateFcmTokenSchema,
} from "../../../validation/users/teacher/profile";
import { catchAsync } from "../../../utils/catchAsync";

const router = Router();

router.get("/", catchAsync(getProfile));
router.put("/", validate(updateProfileSchema), catchAsync(updateProfile));
router.put("/password", validate(changePasswordSchema), catchAsync(changePassword));
router.delete("/", validate(deleteAccountSchema), catchAsync(deleteAccount));
router.post("/fcm-token", validate(updateFcmTokenSchema), catchAsync(updateFcmToken));

export default router;
