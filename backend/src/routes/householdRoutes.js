import { Router } from 'express';
import * as household from '../controllers/householdController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', household.getMyHousehold);
router.post('/', household.createHousehold);
router.post('/join', household.joinHousehold);
router.post('/leave', household.leaveHousehold);
router.put('/', household.updateHousehold);
router.delete('/members/:memberId', household.removeMember);
router.get('/dashboard', household.getDashboard);
router.get('/expenses', household.getExpenses);
router.get('/income', household.getIncome);
router.get('/credit-cards', household.getCreditCards);
router.get('/emis', household.getEmis);

export default router;
