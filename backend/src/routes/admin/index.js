import { Router } from "express";
import { authGuard } from "../../middleware/auth.js";
import requireAdmin from "../../middleware/requireAdmin.js";

import * as dashboard from "../../controllers/admin/dashboard.controller.js";
import * as orders from "../../controllers/admin/order.controller.js";
import * as products from "../../controllers/admin/product.controller.js";
import * as users from "../../controllers/admin/user.controller.js";
import * as coupons from "../../controllers/admin/coupon.controller.js";

const router = Router();

router.use(authGuard(["admin"]), requireAdmin);

// Dashboard
router.get("/dashboard/simple", dashboard.getSimple);
router.get("/dashboard/advanced", dashboard.getAdvanced);

// Orders
router.get("/orders", orders.list);
router.get("/orders/:id", orders.detail);
router.patch("/orders/:id/status", orders.updateStatus);

// Products
router.get("/products", products.listProducts);
router.post("/products", products.createProduct);
router.patch("/products/:id", products.updateProduct);
router.delete("/products/:id", products.deleteProduct);

// Users
router.get("/users", users.list);
router.patch("/users/:id", users.update);

// Coupons
router.get("/coupons", coupons.list);
router.post("/coupons", coupons.create);
router.patch("/coupons/:id", coupons.update);
router.delete("/coupons/:id", coupons.remove);
router.get("/coupons/:id/usage", coupons.usageStats);

export default router;
