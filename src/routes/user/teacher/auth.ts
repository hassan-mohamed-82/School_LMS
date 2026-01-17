import { Router } from "express";
import { login } from "../../../controllers/users/teacher/auth";
import { validate } from "../../../middlewares/validation";
import { loginSchema } from "../../../validation/users/teacher/auth";
import { catchAsync } from "../../../utils/catchAsync";

const router = Router();

router.post("/login", validate(loginSchema), catchAsync(login));

export default router;
