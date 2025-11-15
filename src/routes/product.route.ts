import express from 'express';

const router = express.Router();

import {
  addProduct,
  getProductsByStore,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
  getMyProducts,
  getRelatedProducts
} from '../controllers/product.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

router.post('/',authenticateToken, addProduct);
router.get('/', getAllProducts);
router.get('/my-products', authenticateToken, getMyProducts);
router.get('/:id/related', getRelatedProducts);
router.get('/store/:storeId', getProductsByStore);
router.get('/:slug', getProductById);
router.put('/:id', authenticateToken, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

export default router;