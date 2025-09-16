import express from 'express';

const router = express.Router();

import {
  addProduct,
  getProductsByStore,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts
} from '../controllers/product.controller.js';
import { authenticateToken } from '@/middlewares/auth.middleware.js';

router.post('/',authenticateToken, addProduct);
router.get('/', getAllProducts);
router.get('/store/:storeId', getProductsByStore);
router.get('/:slug', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;