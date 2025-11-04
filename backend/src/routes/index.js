import { Router } from "express";
import { health } from "../controllers/health.controller.js";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import adminRoutes from "./admin/index.js";
import cartRoutes from "./cart.routes.js";
import checkoutRoutes from "./checkout.routes.js";
import variantRoutes from "./variant.routes.js";
import meRoutes from "./me.routes.js";
import orderRoutes from "./order.routes.js";
import { authGuard } from "../middleware/auth.js";
import { sitemap } from "../controllers/sitemap.controller.js";

const router = Router();

router.get("/health", health);
router.get("/sitemap.xml", sitemap);
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/checkout", checkoutRoutes);
router.use("/admin", adminRoutes);
router.use("/me", meRoutes);
router.use("/orders", orderRoutes);
router.use(variantRoutes); // Variant routes (includes /products/:id/variants and /admin/variants/:sku)

router.get("/admin/ping", authGuard(["admin"]), (req, res) => {
  res.json({ ok: true, role: "admin" });
});

export default router;
