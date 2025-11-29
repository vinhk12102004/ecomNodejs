import { Router } from "express";
import { authGuard } from "../middleware/auth.js";
import * as meController from "../controllers/me.controller.js";

const router = Router();

// All routes require authentication
router.use(authGuard());

// Profile management
router.patch("/", meController.updateProfile);

// Address management
router.get("/addresses", meController.listAddresses);
router.post("/addresses", meController.createAddress);
router.patch("/addresses/:addrId", meController.updateAddress);
router.delete("/addresses/:addrId", meController.deleteAddress);
router.patch("/addresses/:addrId/default", meController.setDefaultAddress);

export default router;

