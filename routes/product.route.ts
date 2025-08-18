import express from 'express';

const router = express.Router();

import {
  addProduct,
  getProductsByStore,
  updateProduct,
  deleteProduct,
  getProductById
} from '../controllers/product.controller.js';

router.post('/', addProduct);
router.get('/store/:storeId', getProductsByStore);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;