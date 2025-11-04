import { Router } from "express";
import * as variantController from "../controllers/variant.controller.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

// Public routes - List variants for a product
router.get("/products/:id/variants", variantController.listByProduct);

// Public routes - Get single variant by SKU
router.get("/variants/:sku", variantController.getVariantBySku);

// Admin routes - Create variant for a product
router.post(
  "/admin/products/:id/variants",
  authGuard(["admin"]),
  variantController.create
);

// Admin routes - Update variant
router.patch(
  "/admin/variants/:sku",
  authGuard(["admin"]),
  variantController.update
);

// Admin routes - Delete/deactivate variant
router.delete(
  "/admin/variants/:sku",
  authGuard(["admin"]),
  variantController.remove
);

export default router;

