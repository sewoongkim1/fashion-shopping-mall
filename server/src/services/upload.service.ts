import { getCloudinary } from '../config/cloudinary';

export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
    const cloudinary = getCloudinary();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'fashion-mall/products',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('업로드 실패'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      stream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(publicId);
  }
}
