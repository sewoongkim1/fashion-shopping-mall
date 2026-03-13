import prisma from '../lib/prisma';
import { AppError } from '../lib/AppError';
import type { CreateOrderInput, OrderListQuery } from '../validations/order.validation';
import type { PaginatedResponse } from '../types';

export class OrderService {
  /**
   * 주문번호 생성: ORD-YYYYMMDD-XXXXX
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${dateStr}-${random}`;
  }

  async create(userId: string, input: CreateOrderInput) {
    const { items, ...shippingInfo } = input;

    // 재고 확인 및 상품 유효성 검증
    for (const item of items) {
      const option = await prisma.productOption.findFirst({
        where: {
          productId: item.productId,
          color: item.optionColor,
          size: item.optionSize,
        },
      });

      if (!option) {
        throw AppError.badRequest(`상품 옵션을 찾을 수 없습니다: ${item.productName} (${item.optionColor}/${item.optionSize})`);
      }

      if (option.stock < item.quantity) {
        throw AppError.badRequest(`재고가 부족합니다: ${item.productName} (${item.optionColor}/${item.optionSize}) - 남은 재고: ${option.stock}`);
      }
    }

    // 금액 계산
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = totalAmount >= 50000 ? 0 : 3000;

    // 트랜잭션으로 주문 생성 + 재고 차감
    const order = await prisma.$transaction(async (tx) => {
      // 재고 차감
      for (const item of items) {
        await tx.productOption.updateMany({
          where: {
            productId: item.productId,
            color: item.optionColor,
            size: item.optionSize,
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // 주문 생성
      return tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId,
          totalAmount,
          shippingFee,
          ...shippingInfo,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              optionColor: item.optionColor,
              optionSize: item.optionSize,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });
    });

    return order;
  }

  async findAllByUser(userId: string, query: OrderListQuery): Promise<PaginatedResponse<any>> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where = { userId };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      throw AppError.notFound('주문을 찾을 수 없습니다.');
    }

    if (order.userId !== userId) {
      throw AppError.forbidden('접근 권한이 없습니다.');
    }

    return order;
  }
}

export const orderService = new OrderService();
