import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import * as orderController from "../controllers/order.controller.js";

const router = Router();

// Get user's orders - must be BEFORE /:id route to avoid matching "my" as an ID
router.get("/my", authGuard(), orderController.getMyOrders);

// Get single order detail - allow both authenticated and guest users
// (Guest users need this for VNPAY return page)
// This route uses optional auth, so it can be accessed by guest users
router.get("/:id", authGuard([], { optional: true }), orderController.getMyOrderDetail);

export default router;

