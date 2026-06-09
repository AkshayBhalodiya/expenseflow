import { Router } from 'express';
import * as budget from '../controllers/budgetController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', budget.getBudgets);
router.get('/current', budget.getCurrentMonthBudgetSummary);
router.post('/', budget.createBudget);
router.put('/:id', budget.updateBudget);
router.delete('/:id', budget.deleteBudget);

export default router;
