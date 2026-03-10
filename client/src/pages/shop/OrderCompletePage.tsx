import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  PREPARING: '상품 준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송 완료',
  CANCELLED: '주문 취소',
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

export default function OrderCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order as Order | undefined;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">주문 정보를 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>주문 완료 - Fashion Mall</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* 주문 완료 헤더 */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">주문이 완료되었습니다</h1>
            <p className="mt-2 text-muted-foreground">
              주문번호: <span className="font-mono font-semibold">{order.orderNumber}</span>
            </p>
          </div>

          {/* 주문 상세 */}
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
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 배송 정보 */}
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 font-semibold">배송 정보</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex">
                  <dt className="w-24 text-muted-foreground">수령인</dt>
                  <dd>{order.recipientName}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-muted-foreground">연락처</dt>
                  <dd>{order.recipientPhone}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-muted-foreground">주소</dt>
                  <dd>({order.zipCode}) {order.address} {order.addressDetail}</dd>
                </div>
                {order.deliveryMemo && (
                  <div className="flex">
                    <dt className="w-24 text-muted-foreground">배송 메모</dt>
                    <dd>{order.deliveryMemo}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* 결제 요약 */}
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">결제 수단</span>
                    <span className="font-medium">
                      {PAYMENT_METHOD_LABEL[order.payment.method] || order.payment.method}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">주문 상태</span>
                  <span className="font-medium text-green-600">
                    {STATUS_LABEL[order.status] || order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="mt-8 flex gap-4">
            <Link to="/products" className="flex-1">
              <Button variant="outline" className="w-full">
                쇼핑 계속하기
              </Button>
            </Link>
            <Link to="/orders" className="flex-1">
              <Button className="w-full">
                주문 내역 보기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
