import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { OrderStatus } from '@/types';

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: '결제대기',
  PAID: '결제완료',
  PREPARING: '배송준비',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '취소',
};

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-purple-100 text-purple-700',
  SHIPPING: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
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

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { page, search, status: statusFilter }],
    queryFn: () =>
      adminApi.getOrders({
        page,
        limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      }),
    select: (res) => res.data.data!,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>주문관리 - Admin</title>
      </Helmet>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">주문관리</h1>

        {/* 필터/검색 */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="주문번호, 수령인, 회원명 검색"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-72"
            />
            <Button type="submit" variant="outline" size="sm">
              검색
            </Button>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">전체 상태</option>
            {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {data && (
            <span className="text-sm text-muted-foreground">총 {data.total}건</span>
          )}
        </div>

        {/* 테이블 */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">주문번호</th>
                  <th className="px-4 py-3 text-left font-medium">주문자</th>
                  <th className="px-4 py-3 text-left font-medium">상품</th>
                  <th className="px-4 py-3 text-right font-medium">결제금액</th>
                  <th className="px-4 py-3 text-center font-medium">상태</th>
                  <th className="px-4 py-3 text-left font-medium">주문일시</th>
                  <th className="w-8 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {data?.items.map((order) => {
                  const isExpanded = expandedId === order.id;
                  const totalPayment = order.totalAmount + order.shippingFee;
                  const productSummary =
                    order.items.length > 0
                      ? order.items[0].productName +
                        (order.items.length > 1
                          ? ` 외 ${order.items.length - 1}건`
                          : '')
                      : '-';

                  return (
                    <tr key={order.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.user?.name || '-'}</p>
                        <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3">{productSummary}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatPrice(totalPayment)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatusMutation.mutate({
                              id: order.id,
                              status: e.target.value,
                            })
                          }
                          className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLOR[order.status] || ''}`}
                        >
                          {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </td>
                      {/* 확장 상세 - 인라인으로 처리 */}
                      {isExpanded && (
                        <>
                          {/* 빈 tr로 colspan 사용 */}
                        </>
                      )}
                    </tr>
                  );
                })}
                {/* 확장된 주문 상세 */}
                {data?.items.map((order) => {
                  if (expandedId !== order.id) return null;
                  return (
                    <tr key={`${order.id}-detail`} className="bg-muted/20">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          {/* 주문 상품 */}
                          <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                              주문 상품
                            </h4>
                            <div className="space-y-1">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span>
                                    {item.productName} ({item.optionColor}/{item.optionSize}) x
                                    {item.quantity}
                                  </span>
                                  <span className="font-medium">
                                    {formatPrice(item.price * item.quantity)}
                                  </span>
                                </div>
                              ))}
                              <div className="mt-2 border-t pt-2 text-sm">
                                <div className="flex justify-between">
                                  <span>상품 금액</span>
                                  <span>{formatPrice(order.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>배송비</span>
                                  <span>{formatPrice(order.shippingFee)}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                  <span>총 결제금액</span>
                                  <span>
                                    {formatPrice(order.totalAmount + order.shippingFee)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* 배송 정보 */}
                          <div>
                            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                              배송 정보
                            </h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="text-muted-foreground">수령인:</span>{' '}
                                {order.recipientName}
                              </p>
                              <p>
                                <span className="text-muted-foreground">연락처:</span>{' '}
                                {order.recipientPhone}
                              </p>
                              <p>
                                <span className="text-muted-foreground">주소:</span> (
                                {order.zipCode}) {order.address} {order.addressDetail}
                              </p>
                              {order.deliveryMemo && (
                                <p>
                                  <span className="text-muted-foreground">배송메모:</span>{' '}
                                  {order.deliveryMemo}
                                </p>
                              )}
                              {order.payment && (
                                <p>
                                  <span className="text-muted-foreground">결제수단:</span>{' '}
                                  {order.payment.method || '-'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      주문이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              이전
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
