import { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types';
import { adminService } from '../services/admin.service';
import { AppError } from '../lib/AppError';

class AdminController {
  /** GET /api/admin/dashboard */
  async dashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/admin/users */
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const role = req.query.role as string | undefined;

      const result = await adminService.getUsers({ page, limit, search, role });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /** PATCH /api/admin/users/:id/toggle-active */
  async toggleUserActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.toggleUserActive(req.params.id as string);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  /** PATCH /api/admin/users/:id/role */
  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      if (!role || !['USER', 'ADMIN'].includes(role)) {
        throw AppError.badRequest('유효하지 않은 역할입니다.');
      }
      const user = await adminService.updateUserRole(req.params.id as string, role);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/admin/orders */
  async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;

      const result = await adminService.getOrders({ page, limit, search, status });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /** GET /api/admin/orders/:id */
  async getOrderDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await adminService.getOrderDetail(req.params.id as string);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  /** PATCH /api/admin/orders/:id/status */
  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const order = await adminService.updateOrderStatus(req.params.id as string, status);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
