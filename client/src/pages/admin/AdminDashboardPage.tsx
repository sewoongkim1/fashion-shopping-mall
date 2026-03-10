import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { adminApi, type DashboardStats } from '@/api/admin.api';

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: '결제대기',
  PAID: '결제완료',
  PREPARING: '배송준비',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소',
};

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
    select: (res) => res.data.data as DashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    { label: '총 매출', value: formatPrice(data.totalRevenue), color: 'bg-blue-500' },
    { label: '오늘 매출', value: formatPrice(data.todayRevenue), color: 'bg-green-500' },
    { label: '총 주문', value: `${data.totalOrders}건`, color: 'bg-purple-500' },
    { label: '오늘 주문', value: `${data.todayOrders}건`, color: 'bg-orange-500' },
    { label: '총 회원', value: `${data.totalUsers}명`, color: 'bg-pink-500' },
    { label: '총 상품', value: `${data.totalProducts}개`, color: 'bg-cyan-500' },
  ];

  return (
    <>
      <Helmet>
        <title>대시보드 - Admin</title>
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold">대시보드</h1>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-2xl font-bold">{card.value}</p>
              <div className={`mt-2 h-1 w-12 rounded ${card.color}`} />
            </div>
          ))}
        </div>

        {/* 주문 상태별 현황 */}
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-lg font-semibold">주문 상태별 현황</h2>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
            {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
              <div key={key} className="rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-bold">{data.ordersByStatus[key] || 0}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 월별 매출 */}
          <div className="rounded-lg border bg-card p-4">
            <h2 className="mb-4 text-lg font-semibold">월별 매출 추이</h2>
            <div className="space-y-3">
              {data.monthlySales.map((item) => {
                const maxRevenue = Math.max(...data.monthlySales.map((s) => s.revenue), 1);
                const widthPercent = (item.revenue / maxRevenue) * 100;
                return (
                  <div key={item.month} className="flex items-center gap-3">
                    <span className="w-16 text-sm text-muted-foreground">{item.month}</span>
                    <div className="flex-1">
                      <div className="h-6 rounded bg-muted">
                        <div
                          className="flex h-6 items-center rounded bg-primary px-2 text-xs text-primary-foreground"
                          style={{ width: `${Math.max(widthPercent, 2)}%` }}
                        >
                          {item.revenue > 0 && formatPrice(item.revenue)}
                        </div>
                      </div>
                    </div>
                    <span className="w-12 text-right text-sm text-muted-foreground">
                      {item.orderCount}건
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 최근 주문 */}
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">최근 주문</h2>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-sm text-primary hover:underline"
              >
                전체보기
              </button>
            </div>
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {order.items.length > 0
                        ? order.items[0].productName +
                          (order.items.length > 1 ? ` 외 ${order.items.length - 1}건` : '')
                        : order.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.user.name} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-semibold">
                      {formatPrice(order.totalAmount + order.shippingFee)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {ORDER_STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
              {data.recentOrders.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">주문이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
