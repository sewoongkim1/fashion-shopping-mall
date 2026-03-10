import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { verifyPaymentSchema } from '../validations/payment.validation';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

// 결제 검증 - 인증 필수
router.post('/verify', authMiddleware, validateBody(verifyPaymentSchema), paymentController.verify);

export default router;
