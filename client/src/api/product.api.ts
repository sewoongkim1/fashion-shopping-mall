import apiClient from './client';
import type { Product, ApiResponse, PaginatedResponse, Category, ProductStatus } from '@/types';

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: Category;
  search?: string;
  sort?: 'latest' | 'price_asc' | 'price_desc' | 'name';
  status?: ProductStatus;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  category: Category;
  status?: ProductStatus;
  images?: { url: string; sortOrder: number }[];
  options?: { color: string; size: string; stock: number }[];
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export const productApi = {
  getList: (params?: ProductListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<Product>>>('/api/products', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Product>>(`/api/products/${id}`),

  create: (data: CreateProductRequest) =>
    apiClient.post<ApiResponse<Product>>('/api/products', data),

  update: (id: string, data: UpdateProductRequest) =>
    apiClient.put<ApiResponse<Product>>(`/api/products/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse>(`/api/products/${id}`),
};
