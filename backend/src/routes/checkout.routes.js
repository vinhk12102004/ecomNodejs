import { Router } from "express";
import * as checkoutController from "../controllers/checkout.controller.js";
import { authGuard } from "../middleware/auth.js";
import { guestToken } from "../middleware/guestToken.js";

const router = Router();

// Apply guest token middleware
router.use(guestToken);

// Optional auth for checkout
const optionalAuth = authGuard([], { optional: true });

// POST /checkout/preview - Preview order with coupon
router.post("/preview", optionalAuth, checkoutController.preview);

// POST /checkout/confirm - Create order
router.post("/confirm", optionalAuth, checkoutController.confirm);

export default router;

