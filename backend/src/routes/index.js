import { Router } from "express";
import { health } from "../controllers/health.controller.js";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import adminRoutes from "./admin/index.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

router.get("/health", health);
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/admin", adminRoutes);

router.get("/admin/ping", authGuard(["admin"]), (req, res) => {
  res.json({ ok: true, role: "admin" });
});

export default router;
