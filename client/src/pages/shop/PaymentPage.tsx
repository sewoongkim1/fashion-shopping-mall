import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { paymentApi, type VerifyPaymentRequest } from '@/api/payment.api';
import { Button } from '@/components/ui/button';
import type { Order } from '@/types';

const MERCHANT_CODE = 'imp22672267';

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { clearCart } = useCartStore();

  const order = location.state?.order as Order | undefined;
  const fromCart = location.state?.fromCart as boolean | undefined;

  const [status, setStatus] = useState<'ready' | 'processing' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState('');
  const paymentStarted = useRef(false);

  const verifyMutation = useMutation({
    mutationFn: (data: VerifyPaymentRequest) => paymentApi.verify(data),
    onSuccess: (res) => {
      const verifiedOrder = res.data.data;
      // 장바구니에서 온 경우 장바구니 비우기
      if (fromCart) {
        clearCart();
      }
      navigate('/order/complete', { state: { order: verifiedOrder }, replace: true });
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || '결제 검증에 실패했습니다.';
      setStatus('error');
      setErrorMessage(message);
    },
  });

  useEffect(() => {
    if (!order || paymentStarted.current) return;
    paymentStarted.current = true;

    const IMP = window.IMP;
    if (!IMP) {
      setStatus('error');
      setErrorMessage('결제 모듈을 불러올 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    IMP.init(MERCHANT_CODE);

    const totalAmount = order.totalAmount + order.shippingFee;
    const orderName =
      order.items.length > 1
        ? `${order.items[0].productName} 외 ${order.items.length - 1}건`
        : order.items[0].productName;

    setStatus('processing');

    IMP.request_pay(
      {
        pg: 'html5_inicis',
        pay_method: 'card',
        merchant_uid: order.orderNumber,
        name: orderName,
        amount: totalAmount,
        buyer_email: user?.email || '',
        buyer_name: order.recipientName,
        buyer_tel: order.recipientPhone,
        buyer_addr: `${order.address} ${order.addressDetail}`,
        buyer_postcode: order.zipCode,
      },
      (response: IamportResponse) => {
        if (response.success && response.imp_uid) {
          // 결제 성공 → 서버 검증
          verifyMutation.mutate({
            impUid: response.imp_uid,
            merchantUid: response.merchant_uid,
            orderId: order.id,
          });
        } else {
          // 결제 실패/취소 → 테스트 모드: 주문 완료 페이지로 이동
          if (fromCart) {
            clearCart();
          }
          navigate('/order/complete', { state: { order }, replace: true });
        }
      },
    );
  }, [order]);

  // 주문 정보가 없으면 리다이렉트
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">결제 정보를 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/products')}>
          쇼핑 계속하기
        </Button>
      </div>
    );
  }

  const totalAmount = order.totalAmount + order.shippingFee;

  return (
    <>
      <Helmet>
        <title>결제 진행 중 - Fashion Mall</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-lg">
          {/* 결제 처리 중 */}
          {status === 'processing' && (
            <div className="text-center py-20">
              <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <h1 className="text-xl font-bold">결제 진행 중</h1>
              <p className="mt-2 text-muted-foreground">
                결제창이 열리지 않으면 팝업 차단을 해제해주세요.
              </p>
              <div className="mt-6 rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">주문번호</p>
                <p className="font-mono font-semibold">{order.orderNumber}</p>
                <p className="mt-2 text-sm text-muted-foreground">결제 금액</p>
                <p className="text-lg font-bold text-primary">{formatPrice(totalAmount)}</p>
              </div>
            </div>
          )}

          {/* 결제 준비 */}
          {status === 'ready' && (
            <div className="text-center py-20">
              <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <h1 className="text-xl font-bold">결제를 준비하고 있습니다...</h1>
            </div>
          )}

          {/* 결제 실패/취소 */}
          {status === 'error' && (
            <div className="text-center py-20">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold">결제 실패</h1>
              <p className="mt-2 text-muted-foreground">{errorMessage}</p>

              <div className="mt-6 rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">주문번호</p>
                <p className="font-mono font-semibold">{order.orderNumber}</p>
                <p className="mt-2 text-sm text-muted-foreground">결제 금액</p>
                <p className="text-lg font-bold">{formatPrice(totalAmount)}</p>
              </div>

              <div className="mt-8 flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/products')}>
                  쇼핑 계속하기
                </Button>
                <Button
                  onClick={() => {
                    paymentStarted.current = false;
                    setStatus('ready');
                    setErrorMessage('');
                    // 결제 재시도를 위해 페이지 re-render
                    window.location.reload();
                  }}
                >
                  다시 결제하기
                </Button>
              </div>
            </div>
          )}

          {/* 서버 검증 중 */}
          {verifyMutation.isPending && (
            <div className="text-center py-20">
              <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
              <h1 className="text-xl font-bold">결제를 확인하고 있습니다...</h1>
              <p className="mt-2 text-muted-foreground">잠시만 기다려주세요.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
