import express from 'express';
const router = express.Router();
import { addCategory, getAllCategories, getCategoryById } from '../controllers/category.controller.js';
router.post('/', addCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
// router.put('/:id', updateProduct);
// router.delete('/:id', deleteProduct);
export default router;
//# sourceMappingURL=category.route.js.map