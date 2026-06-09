import { Router } from 'express';
import * as user from '../controllers/userController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/export', user.exportUserData);
router.get('/activity', user.getActivityHistory);

router.use(adminMiddleware);
router.get('/', user.getAllUsers);
router.get('/expenses/all', user.getAllExpensesAdmin);
router.get('/:id', user.getUserById);
router.patch('/:id/role', user.updateUserRole);
router.delete('/:id', user.deleteUser);

export default router;
