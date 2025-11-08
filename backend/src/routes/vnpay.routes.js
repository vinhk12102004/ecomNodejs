import { Router } from "express";
import * as vnpayController from "../controllers/vnpay.controller.js";
import { authGuard } from "../middleware/auth.js";
import { guestToken } from "../middleware/guestToken.js";

const router = Router();

// Optional auth for payment
const optionalAuth = authGuard([], { optional: true });

// POST /api/payment/vnpay/create - Create payment URL
router.post("/create", guestToken, optionalAuth, vnpayController.createPayment);

// GET /api/payment/vnpay/return - Handle return from VNPAY
// Note: VNPAY redirects here, so no auth/guest token needed
router.get("/return", vnpayController.handleReturn);

// POST /api/payment/vnpay/ipn - Handle IPN from VNPAY
// Note: IPN is called by VNPAY server, so no auth/guest token needed
router.post("/ipn", vnpayController.handleIPN);

export default router;

