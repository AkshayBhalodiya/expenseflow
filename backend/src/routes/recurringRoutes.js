import { Router } from 'express';
import * as recurring from '../controllers/recurringController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', recurring.getRecurring);
router.post('/', recurring.createRecurring);
router.put('/:id', recurring.updateRecurring);
router.patch('/:id/toggle', recurring.toggleRecurring);
router.delete('/:id', recurring.deleteRecurring);

export default router;
