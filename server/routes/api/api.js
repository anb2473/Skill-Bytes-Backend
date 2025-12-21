import express from 'express';
import authRoutes from './auth/auth.js'
import userRoutes from './user/user.js'
import adminRoutes from './admin/admin.js'
import authMiddleware from '../../middleware/authMiddleware.js'
import adminMiddleware from '../../middleware/adminMiddleware.js'

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', authMiddleware, userRoutes);
router.use('/admin', adminMiddleware, adminRoutes);

export default router;
