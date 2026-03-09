import { Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { orderListQuerySchema } from '../validations/order.validation';
import type { AuthRequest } from '../types';

export class OrderController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const order = await orderService.create(userId, req.body);

      res.status(201).json({
        success: true,
        data: order,
        message: '주문이 생성되었습니다.',
      });
    } catch (err) {
      if (err instanceof Error && (err.message.includes('재고') || err.message.includes('옵션'))) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const query = orderListQuerySchema.parse(req.query);
      const result = await orderService.findAllByUser(userId, query);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const order = await orderService.findById(id, userId);

      res.json({
        success: true,
        data: order,
      });
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === '주문을 찾을 수 없습니다.') {
          res.status(404).json({ success: false, message: err.message });
          return;
        }
        if (err.message === '접근 권한이 없습니다.') {
          res.status(403).json({ success: false, message: err.message });
          return;
        }
      }
      next(err);
    }
  }
}

export const orderController = new OrderController();
