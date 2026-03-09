import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCartStore, type CartItem } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();
  const hasDiscount = item.originalPrice > item.price;

  return (
    <div className="flex gap-4 border-b py-4">
      {/* 이미지 */}
      <Link to={`/products/${item.productId}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
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
            이미지 없음
          </div>
        )}
      </Link>

      {/* 상품 정보 */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link to={`/products/${item.productId}`} className="font-medium hover:underline">
            {item.productName}
          </Link>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.color} / {item.size}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold">{formatPrice(item.price)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(item.originalPrice)}</span>
            </>
          ) : (
            <span className="text-sm font-bold">{formatPrice(item.price)}</span>
          )}
        </div>
      </div>

      {/* 수량 조절 */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.productId, item.color, item.size)}
          className="text-sm text-muted-foreground hover:text-destructive"
        >
          삭제
        </button>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={item.quantity <= 1}
            onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
          >
            -
          </Button>
          <Input
            type="number"
            min={1}
            max={item.stock}
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.productId, item.color, item.size, Number(e.target.value))
            }
            className="h-8 w-14 text-center"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={item.quantity >= item.stock}
            onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
          >
            +
          </Button>
        </div>

        <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
      </div>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { items, clearCart, totalPrice } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: 주문 페이지로 이동
    alert('주문/결제 기능은 준비 중입니다.');
  };

  return (
    <>
      <Helmet>
        <title>장바구니 - Fashion Mall</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">장바구니</h1>

        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">장바구니가 비어 있습니다.</p>
            <Link to="/products">
              <Button variant="outline" className="mt-4">
                쇼핑 계속하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* 상품 목록 */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-sm text-muted-foreground">
                  총 {items.length}개 상품
                </span>
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  전체 삭제
                </Button>
              </div>

              {items.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.color}-${item.size}`}
                  item={item}
                />
              ))}
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-lg border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">주문 요약</h2>

                <div className="space-y-2 border-b pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">상품 금액</span>
                    <span>{formatPrice(totalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">배송비</span>
                    <span>{totalPrice() >= 50000 ? '무료' : formatPrice(3000)}</span>
                  </div>
                </div>

                <div className="flex justify-between py-4">
                  <span className="font-semibold">총 결제 금액</span>
                  <span className="text-xl font-bold">
                    {formatPrice(totalPrice() + (totalPrice() >= 50000 ? 0 : 3000))}
                  </span>
                </div>

                {totalPrice() < 50000 && (
                  <p className="mb-4 text-xs text-muted-foreground">
                    {formatPrice(50000 - totalPrice())} 더 구매 시 무료배송
                  </p>
                )}

                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  주문하기
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
