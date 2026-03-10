import client from './client';
import type { ApiResponse, Order } from '@/types';

export interface VerifyPaymentRequest {
  impUid: string;
  merchantUid: string;
  orderId: string;
}

export const paymentApi = {
  verify: (data: VerifyPaymentRequest) =>
    client.post<ApiResponse<Order>>('/api/payments/verify', data),
};
