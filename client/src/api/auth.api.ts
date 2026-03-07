import apiClient from './client';
import type { User, ApiResponse } from '@/types';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<User>>('/api/auth/register', data),

  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<User>>('/api/auth/login', data),

  logout: () =>
    apiClient.post<ApiResponse>('/api/auth/logout'),

  refresh: () =>
    apiClient.post<ApiResponse>('/api/auth/refresh'),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/api/auth/me'),
};
