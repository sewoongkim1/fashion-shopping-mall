import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { paymentService } from '../services/payment.service';

class PaymentController {
  async verify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { impUid, merchantUid, orderId } = req.body;

      const order = await paymentService.verifyAndSave(impUid, merchantUid, orderId, userId);

      res.json({
        success: true,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
