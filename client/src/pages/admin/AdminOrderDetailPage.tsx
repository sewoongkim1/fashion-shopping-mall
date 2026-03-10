import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { adminApi } from '@/api/admin.api';
import { Button } from '@/components/ui/button';

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

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => adminApi.getOrderDetail(id!),
    select: (res) => res.data.data!,
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => adminApi.updateOrderStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">주문을 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/orders')}>
          목록으로
        </Button>
      </div>
    );
  }

  const totalPayment = order.totalAmount + order.shippingFee;

  return (
    <>
      <Helmet>
        <title>주문 상세 - {order.orderNumber}</title>
      </Helmet>

      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="mb-2 text-sm text-muted-foreground hover:text-foreground"
            >
              &larr; 주문 목록
            </button>
            <h1 className="text-2xl font-bold">주문 상세</h1>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLOR[order.status] || ''}`}
          >
            {ORDER_STATUS_LABEL[order.status] || order.status}
          </span>
        </div>

        {/* 주문 기본 정보 */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">주문 정보</h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">주문번호</span>
              <p className="font-mono font-medium">{order.orderNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground">주문일시</span>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">주문자</span>
              <p className="font-medium">
                {order.user?.name || '-'} ({order.user?.email})
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">연락처</span>
              <p className="font-medium">{order.user?.phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* 주문 상품 */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">주문 상품</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">상품명</th>
                  <th className="px-4 py-3 text-left font-medium">옵션</th>
                  <th className="px-4 py-3 text-center font-medium">수량</th>
                  <th className="px-4 py-3 text-right font-medium">단가</th>
                  <th className="px-4 py-3 text-right font-medium">소계</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-3 font-medium">{item.productName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.optionColor} / {item.optionSize}
                    </td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatPrice(item.price)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td colSpan={4} className="px-4 py-2 text-right text-muted-foreground">
                    상품 금액
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatPrice(order.totalAmount)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-muted-foreground">
                    배송비
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    {formatPrice(order.shippingFee)}
                  </td>
                </tr>
                <tr className="border-t">
                  <td colSpan={4} className="px-4 py-3 text-right font-bold">
                    총 결제금액
                  </td>
                  <td className="px-4 py-3 text-right text-lg font-bold text-primary">
                    {formatPrice(totalPayment)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 배송 정보 */}
          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold">배송 정보</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">수령인</span>
                <p className="font-medium">{order.recipientName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">연락처</span>
                <p className="font-medium">{order.recipientPhone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">주소</span>
                <p className="font-medium">
                  ({order.zipCode}) {order.address} {order.addressDetail}
                </p>
              </div>
              {order.deliveryMemo && (
                <div>
                  <span className="text-muted-foreground">배송 메모</span>
                  <p className="font-medium">{order.deliveryMemo}</p>
                </div>
              )}
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="rounded-lg border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold">결제 정보</h2>
            {order.payment ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">결제 수단</span>
                  <p className="font-medium">{order.payment.method || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">결제 금액</span>
                  <p className="font-medium">{formatPrice(order.payment.amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">결제 상태</span>
                  <p className="font-medium">{order.payment.status}</p>
                </div>
                {order.payment.approvedAt && (
                  <div>
                    <span className="text-muted-foreground">결제 승인일</span>
                    <p className="font-medium">{formatDate(order.payment.approvedAt)}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">결제 키</span>
                  <p className="font-mono text-xs text-muted-foreground">
                    {order.payment.paymentKey}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">결제 정보가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 상태 변경 */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">주문 상태 변경</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ORDER_STATUS_LABEL).map(([key, label]) => (
              <Button
                key={key}
                variant={order.status === key ? 'default' : 'outline'}
                size="sm"
                disabled={order.status === key || updateStatusMutation.isPending}
                onClick={() => updateStatusMutation.mutate(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
