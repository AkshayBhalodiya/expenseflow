import { Router } from 'express';
import * as analytics from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/dashboard', analytics.getDashboard);
router.get('/', analytics.getAnalyticsData);
router.get('/charts', analytics.getChartData);

export default router;
