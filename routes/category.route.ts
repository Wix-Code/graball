import express from 'express';

const router = express.Router();

import { authenticateToken } from '@/middlewares/auth.middleware.js';
import { addCategory, getAllCategories, getCategoryById } from '../controllers/category.controller.js';

router.post('/', addCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
// router.put('/:id', updateProduct);
// router.delete('/:id', deleteProduct);

export default router;