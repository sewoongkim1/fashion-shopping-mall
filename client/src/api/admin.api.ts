import client from './client';
import type { ApiResponse, PaginatedResponse, User, Order } from '@/types';

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  ordersByStatus: Record<string, number>;
  recentOrders: (Order & { user: { name: string; email: string } })[];
  monthlySales: { month: string; revenue: number; orderCount: number }[];
}

export const adminApi = {
  // Dashboard
  getDashboard: () =>
    client.get<ApiResponse<DashboardStats>>('/api/admin/dashboard'),

  // Users
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    client.get<ApiResponse<PaginatedResponse<User & { _count: { orders: number } }>>>('/api/admin/users', { params }),

  toggleUserActive: (id: string) =>
    client.patch<ApiResponse<User>>(`/api/admin/users/${id}/toggle-active`),

  updateUserRole: (id: string, role: 'USER' | 'ADMIN') =>
    client.patch<ApiResponse<User>>(`/api/admin/users/${id}/role`, { role }),

  // Orders
  getOrders: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    client.get<ApiResponse<PaginatedResponse<Order & { user: { name: string; email: string } }>>>('/api/admin/orders', { params }),

  getOrderDetail: (id: string) =>
    client.get<ApiResponse<Order & { user: { id: string; name: string; email: string; phone?: string } }>>(`/api/admin/orders/${id}`),

  updateOrderStatus: (id: string, status: string) =>
    client.patch<ApiResponse<Order>>(`/api/admin/orders/${id}/status`, { status }),
};
