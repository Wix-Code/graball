import express from "express"

const router = express.Router();

import { authenticateToken, requireVendor } from "@/middlewares/auth.middleware";
import { initializePayment, verifyPayment } from "@/controllers/payment.controller";

router.post('/', initializePayment);
router.get('/verify', verifyPayment);

export default router;