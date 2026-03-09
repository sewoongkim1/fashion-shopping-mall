import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createOrderSchema } from '../validations/order.validation';

const router = Router();

// 모든 주문 API는 인증 필요
router.use(authMiddleware);

router.post('/', validateBody(createOrderSchema), (req, res, next) => orderController.create(req, res, next));
router.get('/', (req, res, next) => orderController.findAll(req, res, next));
router.get('/:id', (req, res, next) => orderController.findById(req, res, next));

export default router;
