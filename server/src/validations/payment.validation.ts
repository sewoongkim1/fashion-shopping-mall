import { z } from 'zod/v4';

export const verifyPaymentSchema = z.object({
  impUid: z.string().min(1, '결제 고유번호(imp_uid)는 필수입니다.'),
  merchantUid: z.string().min(1, '주문번호(merchant_uid)는 필수입니다.'),
  orderId: z.string().min(1, '주문 ID는 필수입니다.'),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
