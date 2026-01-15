import { Router } from "express";
import { updateProfile ,getProfile} from "../../controllers/admin/profile";
import { catchAsync } from "../../utils/catchAsync";

const router = Router();

router.get("/", catchAsync(getProfile));
router.put("/", catchAsync(updateProfile));

export default router;
