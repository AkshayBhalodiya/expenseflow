import { Router } from 'express';
import * as notification from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', notification.getNotifications);
router.patch('/read-all', notification.markAllAsRead);
router.patch('/:id/read', notification.markAsRead);
router.delete('/:id', notification.deleteNotification);

export default router;
