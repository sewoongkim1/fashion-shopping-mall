import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProduct } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { data: product, isLoading } = useProduct(id ?? '');

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground">로딩 중...</div>;
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">상품을 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/products')}>
          상품 목록으로
        </Button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const currentImage = images[selectedImageIndex]?.url;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice! : product.price;

  // 옵션에서 고유 컬러/사이즈 추출
  const options = product.options ?? [];
  const colors = [...new Set(options.map((o) => o.color))];
  const sizes = [...new Set(
    options
      .filter((o) => !selectedColor || o.color === selectedColor)
      .map((o) => o.size),
  )];

  // 선택된 옵션의 재고 확인
  const selectedOption = options.find(
    (o) => o.color === selectedColor && o.size === selectedSize,
  );
  const stock = selectedOption?.stock ?? 0;
  const isSoldOut = product.status === 'SOLDOUT';

  const canOrder = selectedColor && selectedSize && quantity > 0 && stock >= quantity && !isSoldOut;

  const addToCart = () => {
    if (!selectedOption) return;
    addItem({
      productId: product.id,
      productName: product.name,
      imageUrl: images[0]?.url,
      color: selectedColor,
      size: selectedSize,
      price: displayPrice,
      originalPrice: product.price,
      stock: selectedOption.stock,
      quantity,
    });
    setCartMessage('장바구니에 추가되었습니다.');
    setTimeout(() => setCartMessage(''), 2000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedOption) return;
    const orderItem = {
      productId: product.id,
      productName: product.name,
      imageUrl: images[0]?.url,
      color: selectedColor,
      size: selectedSize,
      price: displayPrice,
      originalPrice: product.price,
      stock: selectedOption.stock,
      quantity,
    };
    navigate('/order', { state: { orderItems: [orderItem] } });
  };

  const discountRate = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>{product.name} - Fashion Mall</title>
        <meta name="description" content={product.description?.slice(0, 160)} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* 이미지 갤러리 */}
          <div>
            {/* 메인 이미지 */}
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  이미지 없음
                </div>
              )}
            </div>

            {/* 썸네일 목록 */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 ${
                      i === selectedImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${product.name} ${i + 1}`}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            {/* 이름 & 상태 */}
            <div>
              {isSoldOut && <Badge variant="destructive" className="mb-2">품절</Badge>}
              <h1 className="text-2xl font-bold">{product.name}</h1>
            </div>

            {/* 가격 */}
            <div>
              {hasDiscount ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-destructive">
                      {discountRate}%
                    </span>
                    <span className="text-2xl font-bold">{formatPrice(displayPrice)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </p>
                </div>
              ) : (
                <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* 옵션 선택 */}
            {colors.length > 0 && (
              <div className="space-y-4">
                {/* 컬러 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">컬러</label>
                  <Select value={selectedColor} onValueChange={(v) => { setSelectedColor(v); setSelectedSize(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="컬러를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 사이즈 */}
                {selectedColor && sizes.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">사이즈</label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="사이즈를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((size) => {
                          const opt = options.find((o) => o.color === selectedColor && o.size === size);
                          const outOfStock = !opt || opt.stock === 0;
                          return (
                            <SelectItem key={size} value={size} disabled={outOfStock}>
                              {size}{outOfStock ? ' (품절)' : ` (재고: ${opt!.stock})`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 수량 */}
                {selectedOption && stock > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">수량</label>
                    <Input
                      type="number"
                      min={1}
                      max={stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(stock, Number(e.target.value))))}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 합계 */}
            {canOrder && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">총 상품 금액</span>
                  <span className="text-xl font-bold">{formatPrice(displayPrice * quantity)}</span>
                </div>
              </div>
            )}

            {/* 구매 버튼 */}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                variant="outline"
                size="lg"
                disabled={!canOrder}
                onClick={addToCart}
              >
                장바구니 담기
              </Button>
              <Button
                className="flex-1"
                size="lg"
                disabled={!canOrder}
                onClick={handleBuyNow}
              >
                {isSoldOut ? '품절' : '즉시구매'}
              </Button>
            </div>

            {cartMessage && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
                {cartMessage}
              </div>
            )}

            {/* 상품 설명 */}
            <div className="border-t pt-6">
              <h2 className="mb-3 text-lg font-semibold">상품 설명</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
