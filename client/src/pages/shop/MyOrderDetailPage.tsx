import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { orderApi } from '@/api/order.api';
import { Button } from '@/components/ui/button';
import { PageLoading } from '@/components/ui/loading-spinner';
import type { OrderStatus } from '@/types';

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

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  card: '신용카드',
  trans: '실시간 계좌이체',
  vbank: '가상계좌',
  phone: '휴대폰 소액결제',
  kakaopay: '카카오페이',
  tosspay: '토스페이',
  naverpay: '네이버페이',
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

export default function MyOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['myOrder', id],
    queryFn: () => orderApi.getById(id!),
    enabled: !!id,
  });

  const order = data?.data?.data;

  if (isLoading) return <PageLoading message="주문 정보를 불러오는 중..." />;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">주문 정보를 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/my-orders')}>
          주문 내역으로
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>주문 상세 - Fashion Mall</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* 헤더 */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">주문 상세</h1>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{order.orderNumber}</p>
            </div>
            <span
              className={`inline-block w-fit rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLOR[order.status]}`}
            >
              {STATUS_LABEL[order.status]}
            </span>
          </div>

          <div className="space-y-6">
            {/* 주문 상품 */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 font-semibold">주문 상품</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <span>{item.productName}</span>
                      <span className="ml-2 text-muted-foreground">
                        ({item.optionColor}/{item.optionSize}) x {item.quantity}
                      </span>
                    </div>
                    <span className="ml-4 shrink-0 font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 font-semibold">배송 정보</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex">
                  <dt className="w-24 shrink-0 text-muted-foreground">수령인</dt>
                  <dd>{order.recipientName}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 shrink-0 text-muted-foreground">연락처</dt>
                  <dd>{order.recipientPhone}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 shrink-0 text-muted-foreground">주소</dt>
                  <dd>({order.zipCode}) {order.address} {order.addressDetail}</dd>
                </div>
                {order.deliveryMemo && (
                  <div className="flex">
                    <dt className="w-24 shrink-0 text-muted-foreground">배송 메모</dt>
                    <dd>{order.deliveryMemo}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* 결제 정보 */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 font-semibold">결제 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">상품 금액</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">배송비</span>
                  <span>{order.shippingFee === 0 ? '무료' : formatPrice(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">총 결제 금액</span>
                  <span className="text-lg font-bold">
                    {formatPrice(order.totalAmount + order.shippingFee)}
                  </span>
                </div>
                {order.payment && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">결제 수단</span>
                      <span>{PAYMENT_METHOD_LABEL[order.payment.method] || order.payment.method}</span>
                    </div>
                    {order.payment.approvedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">결제 일시</span>
                        <span>{formatDate(order.payment.approvedAt)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">주문 일시</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="mt-8 flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/my-orders')}>
              주문 내역으로
            </Button>
            <Button className="flex-1" onClick={() => navigate('/products')}>
              쇼핑 계속하기
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
