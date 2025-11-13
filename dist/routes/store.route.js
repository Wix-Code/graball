import express from "express";
const router = express.Router();
import { addStore, deleteStore, getAllStores, getMyStore, getStoreById, updateStore } from "@/controllers/store.controller.js";
import { authenticateToken } from "@/middlewares/auth.middleware";
router.post('/', authenticateToken, addStore);
router.get('/', getAllStores);
router.get("/my-store", authenticateToken, getMyStore);
router.get('/:slug', getStoreById);
router.post('/update-store', authenticateToken, updateStore);
router.post('/delete-store', deleteStore);
export default router;
//# sourceMappingURL=store.route.js.map