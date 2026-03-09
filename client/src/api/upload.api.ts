import apiClient from './client';
import type { ApiResponse } from '@/types';

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<ApiResponse<UploadResult>>('/api/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return apiClient.post<ApiResponse<UploadResult[]>>('/api/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
