import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/refresh', auth.refreshToken);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.get('/verify-email', auth.verifyEmail);

router.use(authMiddleware);
router.post('/logout', auth.logout);
router.post('/change-password', auth.changePassword);
router.get('/profile', auth.getProfile);
router.put('/profile', auth.updateProfile);
router.post('/avatar', upload.single('avatar'), auth.uploadAvatar);

export default router;
