import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validate";
import { authSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/register", validateBody(authSchema.register), register);
router.post("/login", validateBody(authSchema.login), login);

export default router;
