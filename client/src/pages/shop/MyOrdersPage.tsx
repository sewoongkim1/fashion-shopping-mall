import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { orderApi } from '@/api/order.api';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading-spinner';
import type { Order, OrderStatus } from '@/types';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '상품 준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송 완료',
  CANCELLED: '주문 취소',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'text-yellow-600 bg-yellow-50',
  PAID: 'text-blue-600 bg-blue-50',
  PREPARING: 'text-indigo-600 bg-indigo-50',
  SHIPPING: 'text-purple-600 bg-purple-50',
  DELIVERED: 'text-green-600 bg-green-50',
  CANCELLED: 'text-red-600 bg-red-50',
};

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function MyOrdersPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['myOrders', page],
    queryFn: () => orderApi.getList({ page, limit }),
  });

  const orders = data?.data?.data?.items ?? [];
  const totalPages = data?.data?.data?.totalPages ?? 1;

  if (isLoading) return <PageLoading message="주문 내역을 불러오는 중..." />;

  return (
    <>
      <Helmet>
        <title>주문 내역 - Fashion Mall</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">주문 내역</h1>

        {orders.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground">주문 내역이 없습니다.</p>
            <Link to="/products">
              <Button className="mt-4">상품 보러가기</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Order) => (
              <Link
                key={order.id}
                to={`/my-orders/${order.id}`}
                className="block rounded-lg border bg-card p-4 transition hover:shadow-md sm:p-6"
              >
                {/* 헤더: 주문번호 + 상태 */}
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="font-mono text-sm font-semibold">
                      {order.orderNumber}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <span
                    className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>

                {/* 상품 목록 */}
                <div className="space-y-1 text-sm">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="truncate text-muted-foreground">
                        {item.productName} ({item.optionColor}/{item.optionSize}) x{item.quantity}
                      </span>
                      <span className="ml-4 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      외 {order.items.length - 2}건
                    </p>
                  )}
                </div>

                {/* 합계 */}
                <div className="mt-3 flex items-center justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">총 결제금액</span>
                  <span className="font-bold">
                    {formatPrice(order.totalAmount + order.shippingFee)}
                  </span>
                </div>
              </Link>
            ))}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  이전
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
