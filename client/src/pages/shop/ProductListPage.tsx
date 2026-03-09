import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProductList } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/types';

const CATEGORIES: { value: Category | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'TOP', label: '상의' },
  { value: 'BOTTOM', label: '하의' },
  { value: 'OUTER', label: '아우터' },
  { value: 'DRESS', label: '원피스' },
  { value: 'SHOES', label: '신발' },
  { value: 'BAG', label: '가방' },
  { value: 'ACCESSORY', label: '액세서리' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'price_asc', label: '낮은 가격순' },
  { value: 'price_desc', label: '높은 가격순' },
  { value: 'name', label: '이름순' },
];

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || 'ALL';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = Number(searchParams.get('page')) || 1;

  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading } = useProductList({
    category: category === 'ALL' ? undefined : (category as Category),
    search: search || undefined,
    sort: sort as 'latest' | 'price_asc' | 'price_desc' | 'name',
    page,
    limit: 12,
  });

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'ALL') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // 필터 변경 시 페이지 리셋
    if (!('page' in updates)) {
      params.delete('page');
    }
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <>
      <Helmet>
        <title>상품 목록 - Fashion Mall</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* 카테고리 탭 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value || (category === 'ALL' && cat.value === 'ALL') ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateParams({ category: cat.value })}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* 검색 + 정렬 */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="상품명을 입력하세요"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-60"
            />
            <Button type="submit" variant="outline" size="default">
              검색
            </Button>
          </form>

          <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 상품 그리드 */}
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">로딩 중...</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            {search ? `"${search}" 검색 결과가 없습니다.` : '등록된 상품이 없습니다.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => {
              const thumbnail = product.images?.[0]?.url;
              const hasDiscount = product.salePrice && product.salePrice < product.price;

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
                >
                  {/* 이미지 */}
                  <div className="aspect-square overflow-hidden bg-muted">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="p-3">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <div className="mt-1">
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-destructive">
                            {formatPrice(product.salePrice!)}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParams({ page: String(page - 1) })}
            >
              이전
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateParams({ page: String(p) })}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: String(page + 1) })}
            >
              다음
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
