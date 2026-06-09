import { Router } from 'express';
import * as income from '../controllers/incomeController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', income.getIncome);
router.post('/', income.createIncome);
router.put('/:id', income.updateIncome);
router.delete('/:id', income.deleteIncome);

export default router;
