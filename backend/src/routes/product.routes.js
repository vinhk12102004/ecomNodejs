import { Router } from "express";
import { listProducts, getProduct, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";
import { validate } from "../middleware/validate.js";
import { ListQuerySchema, CreateProductSchema, UpdateProductSchema } from "../controllers/product.schemas.js";
import { authGuard } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", validate(ListQuerySchema, "query"), listProducts);
router.get("/:id", getProduct);

// Admin-only routes
router.post("/", authGuard(["admin"]), validate(CreateProductSchema), createProduct);
router.put("/:id", authGuard(["admin"]), validate(UpdateProductSchema), updateProduct);
router.delete("/:id", authGuard(["admin"]), deleteProduct);

export default router;
