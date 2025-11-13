import express from "express";
const router = express.Router();
import { initializePayment, verifyPayment } from "../controllers/payment.controller.js";
router.post('/', initializePayment);
router.get('/verify', verifyPayment);
export default router;
//# sourceMappingURL=payment.route.js.map