import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMutation } from '@tanstack/react-query';
import { useCartStore, type CartItem } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { orderApi, type CreateOrderRequest } from '@/api/order.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

export default function OrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { items: cartItems } = useCartStore();

  // 즉시구매 또는 장바구니에서 온 상품
  const orderItems: CartItem[] = location.state?.orderItems || cartItems;

  const [form, setForm] = useState({
    recipientName: user?.name || '',
    recipientPhone: user?.phone || '',
    zipCode: '',
    address: '',
    addressDetail: '',
    deliveryMemo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 금액 계산
  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = totalPrice >= 50000 ? 0 : 3000;
  const totalAmount = totalPrice + shippingFee;

  const fromCart = !location.state?.orderItems;

  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderRequest) => orderApi.create(data),
    onSuccess: (res) => {
      const order = res.data.data;
      // 결제 페이지로 이동 (장바구니 비우기는 결제 완료 후 처리)
      navigate('/payment', { state: { order, fromCart }, replace: true });
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || '주문 생성에 실패했습니다.';
      setErrors({ submit: message });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.recipientName.trim()) newErrors.recipientName = '수령인 이름을 입력해주세요.';
    if (!form.recipientPhone.trim()) newErrors.recipientPhone = '연락처를 입력해주세요.';
    if (!form.zipCode.trim()) newErrors.zipCode = '우편번호를 입력해주세요.';
    if (!form.address.trim()) newErrors.address = '주소를 입력해주세요.';
    if (!form.addressDetail.trim()) newErrors.addressDetail = '상세주소를 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: CreateOrderRequest = {
      items: orderItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        optionColor: item.color,
        optionSize: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      recipientName: form.recipientName,
      recipientPhone: form.recipientPhone,
      zipCode: form.zipCode,
      address: form.address,
      addressDetail: form.addressDetail,
      deliveryMemo: form.deliveryMemo || undefined,
    };

    createOrderMutation.mutate(data);
  };

  // 주문 상품이 없으면 리다이렉트
  if (orderItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">주문할 상품이 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/products')}>
          쇼핑 계속하기
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>주문하기 - Fashion Mall</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">주문하기</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* 왼쪽: 배송 정보 + 주문 상품 */}
            <div className="space-y-8 lg:col-span-2">
              {/* 배송 정보 */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">배송 정보</h2>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="recipientName">수령인 *</Label>
                      <Input
                        id="recipientName"
                        name="recipientName"
                        value={form.recipientName}
                        onChange={handleChange}
                        placeholder="수령인 이름"
                        className="mt-1"
                      />
                      {errors.recipientName && (
                        <p className="mt-1 text-sm text-destructive">{errors.recipientName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="recipientPhone">연락처 *</Label>
                      <Input
                        id="recipientPhone"
                        name="recipientPhone"
                        value={form.recipientPhone}
                        onChange={handleChange}
                        placeholder="010-0000-0000"
                        className="mt-1"
                      />
                      {errors.recipientPhone && (
                        <p className="mt-1 text-sm text-destructive">{errors.recipientPhone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="zipCode">우편번호 *</Label>
                    <div className="mt-1 flex gap-2">
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={form.zipCode}
                        onChange={handleChange}
                        placeholder="우편번호"
                        className="w-40"
                      />
                    </div>
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-destructive">{errors.zipCode}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address">주소 *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="기본 주소"
                      className="mt-1"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-destructive">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="addressDetail">상세주소 *</Label>
                    <Input
                      id="addressDetail"
                      name="addressDetail"
                      value={form.addressDetail}
                      onChange={handleChange}
                      placeholder="상세주소 (동/호수 등)"
                      className="mt-1"
                    />
                    {errors.addressDetail && (
                      <p className="mt-1 text-sm text-destructive">{errors.addressDetail}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="deliveryMemo">배송 메모</Label>
                    <Textarea
                      id="deliveryMemo"
                      name="deliveryMemo"
                      value={form.deliveryMemo}
                      onChange={handleChange}
                      placeholder="배송 시 요청사항을 입력해주세요."
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* 주문 상품 목록 */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">
                  주문 상품 ({orderItems.length}개)
                </h2>

                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.color}-${item.size}`}
                      className="flex items-center gap-4 border-b py-3 last:border-b-0"
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No img
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.color} / {item.size} · {item.quantity}개
                        </p>
                      </div>

                      <p className="font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 오른쪽: 결제 요약 */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">결제 금액</h2>

                <div className="space-y-2 border-b pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">상품 금액</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">배송비</span>
                    <span>{shippingFee === 0 ? '무료' : formatPrice(shippingFee)}</span>
                  </div>
                </div>

                <div className="flex justify-between py-4">
                  <span className="font-semibold">총 결제 금액</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                {errors.submit && (
                  <p className="mb-4 text-sm text-destructive">{errors.submit}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? '주문 처리 중...' : `${formatPrice(totalAmount)} 결제하기`}
                </Button>

                <p className="mt-3 text-center text-xs text-muted-foreground">
                  주문 내용을 확인하였으며, 결제에 동의합니다.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
