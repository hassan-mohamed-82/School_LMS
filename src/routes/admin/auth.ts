import { Router } from "express";
import { login } from "../../controllers/admin/auth";
import { catchAsync } from "../../utils/catchAsync";

const router = Router()

router.post("/login", catchAsync(login))

export default router
