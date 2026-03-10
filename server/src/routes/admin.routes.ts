import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// 모든 Admin API는 인증 + ADMIN 역할 필요
router.get('/dashboard', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => adminController.dashboard(req, res, next));
router.get('/users', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => adminController.getUsers(req, res, next));
router.patch('/users/:id/toggle-active', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => adminController.toggleUserActive(req, res, next));
router.patch('/users/:id/role', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => adminController.updateUserRole(req, res, next));
router.get('/orders', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => adminController.getOrders(req, res, next));
router.get('/orders/:id', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => adminController.getOrderDetail(req, res, next));
router.patch('/orders/:id/status', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => adminController.updateOrderStatus(req, res, next));

export default router;
