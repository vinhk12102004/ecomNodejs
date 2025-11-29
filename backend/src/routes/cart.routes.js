import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { authGuard } from "../middleware/auth.js";
import { guestToken } from "../middleware/guestToken.js";

const router = Router();

// Apply guest token middleware to all routes
router.use(guestToken);

// Optional auth: if user is logged in, use userId; otherwise use guestToken
const optionalAuth = authGuard([], { optional: true });

// GET /cart - Get current cart
router.get("/", optionalAuth, cartController.getCart);

// GET /cart/count - Get cart item count (for badge)
router.get("/count", optionalAuth, cartController.getCartCount);

// POST /cart/items - Add item to cart (MERGE logic)
router.post("/items", optionalAuth, cartController.addItem);

// POST /cart/items/bulk - Bulk add items
router.post("/items/bulk", optionalAuth, cartController.bulkAddItems);

// PATCH /cart/items/:productId - Update item quantity
router.patch("/items/:productId", optionalAuth, cartController.updateItemQty);

// DELETE /cart/items/:productId - Remove item from cart
router.delete("/items/:productId", optionalAuth, cartController.removeItem);

// DELETE /cart - Clear entire cart
router.delete("/", optionalAuth, cartController.clearCart);

export default router;

