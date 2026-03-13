import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { productListQuerySchema } from '../validations/product.validation';

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);

      res.status(201).json({
        success: true,
        data: product,
        message: '상품이 등록되었습니다.',
      });
    } catch (err) {
      next(err);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = productListQuerySchema.parse(req.query);
      const result = await productService.findAll(query);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await productService.findById(id);

      res.json({
        success: true,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const product = await productService.update(id, req.body);

      res.json({
        success: true,
        data: product,
        message: '상품이 수정되었습니다.',
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await productService.delete(id);

      res.json({
        success: true,
        message: '상품이 삭제되었습니다.',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const productController = new ProductController();
