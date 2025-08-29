import express from "express"

const router = express.Router();

import { addStore, deleteStore, getAllStores, getStoreById, updateStore } from "@/controllers/store.controller.js";
import { authenticateToken, requireVendor } from "@/middlewares/auth.middleware";

router.post('/', authenticateToken, addStore);
router.get('/', getAllStores);
router.post('/:id', getStoreById);
router.post('/update-store/:id', authenticateToken, updateStore);
router.post('/delete-store', deleteStore);

export default router;