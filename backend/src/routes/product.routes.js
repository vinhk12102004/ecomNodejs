import { Router } from "express";
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { createReview, listReviews } from "../controllers/review.controller.js";
import { upsertRating, getMyRating } from "../controllers/rating.controller.js";
import { validate } from "../middleware/validate.js";
import { ListQuerySchema, CreateProductSchema, UpdateProductSchema } from "../controllers/product.schemas.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", validate(ListQuerySchema, "query"), listProducts);
router.get("/:id", getProduct);

// Reviews (no auth required for create per spec)
router.post("/:id/reviews", createReview);
router.get("/:id/reviews", listReviews);

// Ratings (auth required)
router.post("/:id/ratings", authGuard(["customer", "admin"]), upsertRating);
router.get("/:id/ratings/me", authGuard(["customer", "admin"]), getMyRating);

// Admin-only routes
router.post("/", authGuard(["admin"]), validate(CreateProductSchema), createProduct);
router.put("/:id", authGuard(["admin"]), validate(UpdateProductSchema), updateProduct);
router.delete("/:id", authGuard(["admin"]), deleteProduct);

export default router;
