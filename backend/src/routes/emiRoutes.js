import { Router } from 'express';
import * as emi from '../controllers/emiController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', emi.getEMIs);
router.get('/dashboard', emi.getEMIDashboard);
router.post('/', emi.createEMI);
router.put('/:id', emi.updateEMI);
router.post('/:id/pay', emi.payEMI);
router.delete('/:id', emi.deleteEMI);

export default router;
