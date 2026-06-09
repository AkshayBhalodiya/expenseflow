import { Router } from 'express';
import * as creditCard from '../controllers/creditCardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', creditCard.getCreditCards);
router.get('/dashboard', creditCard.getDashboard);
router.post('/', creditCard.createCreditCard);
router.get('/:id/payments', creditCard.getPayments);
router.get('/:id/transactions', creditCard.getCardTransactions);
router.post('/:id/pay', creditCard.recordPayment);
router.put('/:id', creditCard.updateCreditCard);
router.delete('/:id', creditCard.deleteCreditCard);

export default router;
