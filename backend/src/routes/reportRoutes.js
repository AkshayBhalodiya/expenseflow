import { Router } from 'express';
import * as report from '../controllers/reportController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', report.getReport);
router.get('/export', report.exportReport);

export default router;
