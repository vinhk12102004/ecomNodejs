import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import * as orderController from "../controllers/order.controller.js";

const router = Router();

// All routes require authentication
router.use(authGuard());

// Get user's orders
router.get("/my", orderController.getMyOrders);

// Get single order detail (must belong to user)
router.get("/:id", orderController.getMyOrderDetail);

export default router;

