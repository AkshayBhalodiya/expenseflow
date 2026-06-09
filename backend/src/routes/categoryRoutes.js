import { Router } from 'express';
import * as category from '../controllers/categoryController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', category.getCategories);

router.use(authMiddleware, adminMiddleware);
router.post('/', category.createCategory);
router.put('/:id', category.updateCategory);
router.delete('/:id', category.deleteCategory);

export default router;
