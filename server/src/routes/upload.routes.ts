import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();
const controller = new UploadController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'));
    }
  },
});

// 단일 이미지 업로드
router.post(
  '/image',
  authMiddleware,
  roleMiddleware('ADMIN'),
  upload.single('image'),
  controller.uploadImage.bind(controller)
);

// 다중 이미지 업로드 (최대 10장)
router.post(
  '/images',
  authMiddleware,
  roleMiddleware('ADMIN'),
  upload.array('images', 10),
  controller.uploadImages.bind(controller)
);

export default router;
