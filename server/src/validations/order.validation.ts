import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().min(1, '상품 ID가 필요합니다.'),
  productName: z.string().min(1, '상품명이 필요합니다.'),
  optionColor: z.string().min(1, '컬러를 선택해주세요.'),
  optionSize: z.string().min(1, '사이즈를 선택해주세요.'),
  quantity: z.number().int().min(1, '수량은 1 이상이어야 합니다.'),
  price: z.number().int().min(0, '가격은 0 이상이어야 합니다.'),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, '주문 상품이 필요합니다.'),
  recipientName: z.string().min(1, '수령인 이름을 입력해주세요.'),
  recipientPhone: z.string().min(1, '수령인 연락처를 입력해주세요.'),
  zipCode: z.string().min(1, '우편번호를 입력해주세요.'),
  address: z.string().min(1, '주소를 입력해주세요.'),
  addressDetail: z.string().min(1, '상세주소를 입력해주세요.'),
  deliveryMemo: z.string().optional(),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
