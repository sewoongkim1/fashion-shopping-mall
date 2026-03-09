import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';

const uploadService = new UploadService();

export class UploadController {
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: '파일이 없습니다.' });
        return;
      }

      const result = await uploadService.uploadImage(req.file);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: '파일이 없습니다.' });
        return;
      }

      const results = await Promise.all(files.map((file) => uploadService.uploadImage(file)));

      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}
