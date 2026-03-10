import prisma from '../lib/prisma';

export class AdminService {
  /** 대시보드 통계 */
  async getDashboardStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      todayOrders,
      todayRevenueResult,
      ordersByStatus,
      recentOrders,
      monthlySales,
    ] = await Promise.all([
      // 전체 회원 수
      prisma.user.count(),
      // 전체 상품 수 (삭제 제외)
      prisma.product.count({ where: { isDeleted: false } }),
      // 전체 주문 수
      prisma.order.count(),
      // 전체 매출 (PAID 이상)
      prisma.order.aggregate({
        _sum: { totalAmount: true, shippingFee: true },
        where: { status: { in: ['PAID', 'PREPARING', 'SHIPPING', 'DELIVERED'] } },
      }),
      // 오늘 주문 수
      prisma.order.count({
        where: {
          createdAt: { gte: getStartOfToday() },
        },
      }),
      // 오늘 매출
      prisma.order.aggregate({
        _sum: { totalAmount: true, shippingFee: true },
        where: {
          status: { in: ['PAID', 'PREPARING', 'SHIPPING', 'DELIVERED'] },
          createdAt: { gte: getStartOfToday() },
        },
      }),
      // 주문 상태별 카운트
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // 최근 주문 5건
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { name: true, email: true } },
        },
      }),
      // 최근 6개월 월별 매출
      this.getMonthlySales(),
    ]);

    const totalRevenue =
      (revenueResult._sum.totalAmount || 0) + (revenueResult._sum.shippingFee || 0);
    const todayRevenue =
      (todayRevenueResult._sum.totalAmount || 0) + (todayRevenueResult._sum.shippingFee || 0);

    const statusCounts: Record<string, number> = {};
    for (const item of ordersByStatus) {
      statusCounts[item.status] = item._count.id;
    }

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      todayOrders,
      todayRevenue,
      ordersByStatus: statusCounts,
      recentOrders,
      monthlySales,
    };
  }

  /** 최근 6개월 월별 매출 */
  private async getMonthlySales() {
    const months: { month: string; revenue: number; orderCount: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;

      const [agg, count] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true, shippingFee: true },
          where: {
            status: { in: ['PAID', 'PREPARING', 'SHIPPING', 'DELIVERED'] },
            createdAt: { gte: start, lt: end },
          },
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: start, lt: end },
          },
        }),
      ]);

      months.push({
        month: label,
        revenue: (agg._sum.totalAmount || 0) + (agg._sum.shippingFee || 0),
        orderCount: count,
      });
    }

    return months;
  }

  /** 회원 목록 (Admin) */
  async getUsers(query: { page: number; limit: number; search?: string; role?: string }) {
    const { page, limit, search, role } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role && (role === 'USER' || role === 'ADMIN')) {
      where.role = role;
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /** 회원 상태 변경 */
  async toggleUserActive(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('회원을 찾을 수 없습니다.');

    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, name: true, isActive: true },
    });
  }

  /** 회원 역할 변경 */
  async updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('회원을 찾을 수 없습니다.');

    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  /** 전체 주문 목록 (Admin) */
  async getOrders(query: { page: number; limit: number; search?: string; status?: string }) {
    const { page, limit, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: { select: { name: true, email: true } },
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

  /** 주문 상태 변경 */
  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = ['PENDING', 'PAID', 'PREPARING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error('유효하지 않은 주문 상태입니다.');
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('주문을 찾을 수 없습니다.');

    return prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
        payment: true,
      },
    });
  }
}

function getStartOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export const adminService = new AdminService();
