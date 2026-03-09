import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../validations/product.validation';

const router = Router();

// Public
router.get('/', (req, res, next) => productController.findAll(req, res, next));
router.get('/:id', (req, res, next) => productController.findById(req, res, next));

// Admin only
router.post('/', authMiddleware, roleMiddleware('ADMIN'), validateBody(createProductSchema), (req, res, next) => productController.create(req, res, next));
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), validateBody(updateProductSchema), (req, res, next) => productController.update(req, res, next));
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), (req, res, next) => productController.delete(req, res, next));

export default router;
