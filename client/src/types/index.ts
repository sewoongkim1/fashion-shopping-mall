// Enums
export type Role = 'USER' | 'ADMIN';

export type Category =
  | 'TOP'
  | 'BOTTOM'
  | 'OUTER'
  | 'DRESS'
  | 'BAG'
  | 'SHOES'
  | 'ACCESSORY';

export type ProductStatus = 'ACTIVE' | 'SOLDOUT' | 'HIDDEN';
export type OrderStatus = 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'FAILED' | 'CANCELLED';

// Models
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: Category;
  images: ProductImage[];
  options: ProductOption[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  sortOrder: number;
}

export interface ProductOption {
  id: string;
  color: string;
  size: string;
  stock: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  status: OrderStatus;
  recipientName: string;
  recipientPhone: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  deliveryMemo?: string;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  optionColor: string;
  optionSize: string;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentKey: string;
  method: string;
  amount: number;
  status: PaymentStatus;
  approvedAt?: string;
  createdAt: string;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
