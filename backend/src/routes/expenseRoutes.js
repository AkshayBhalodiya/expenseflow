import { Router } from 'express';
import * as expense from '../controllers/expenseController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(authMiddleware);

router.get('/', expense.getExpenses);
router.post('/scan-receipt', upload.single('receipt'), expense.scanReceipt);
router.get('/:id', expense.getExpenseById);
router.post('/', upload.single('receipt'), expense.createExpense);
router.put('/:id', upload.single('receipt'), expense.updateExpense);
router.delete('/:id', expense.deleteExpense);

export default router;
