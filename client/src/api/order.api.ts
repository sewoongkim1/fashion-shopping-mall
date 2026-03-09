import apiClient from './client';
import type { Order, ApiResponse, PaginatedResponse } from '@/types';

export interface CreateOrderRequest {
  items: {
    productId: string;
    productName: string;
    optionColor: string;
    optionSize: string;
    quantity: number;
    price: number;
  }[];
  recipientName: string;
  recipientPhone: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  deliveryMemo?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
}

export const orderApi = {
  create: (data: CreateOrderRequest) =>
    apiClient.post<ApiResponse<Order>>('/api/orders', data),

  getList: (params?: OrderListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<Order>>>('/api/orders', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`),
};
