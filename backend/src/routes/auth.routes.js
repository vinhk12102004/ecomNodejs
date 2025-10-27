import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authGuard(), authController.me);

export default router;
