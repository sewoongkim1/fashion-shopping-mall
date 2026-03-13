import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductList, useDeleteProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Category, Product, ProductStatus } from '@/types';

const CATEGORY_LABELS: Record<Category, string> = {
  TOP: '상의',
  BOTTOM: '하의',
  OUTER: '아우터',
  DRESS: '원피스',
  SHOES: '신발',
  BAG: '가방',
  ACCESSORY: '액세서리',
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: '판매중',
  SOLDOUT: '품절',
  HIDDEN: '숨김',
};

const STATUS_VARIANTS: Record<ProductStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  ACTIVE: 'default',
  SOLDOUT: 'destructive',
  HIDDEN: 'secondary',
};

function formatPrice(price: number) {
  return price.toLocaleString('ko-KR') + '원';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<Category | 'ALL'>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const deleteProduct = useDeleteProduct();

  const { data, isLoading } = useProductList({
    page,
    limit: 10,
    category: category === 'ALL' ? undefined : category,
    search: search || undefined,
    sort: 'latest',
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCategoryChange = (value: string | null) => {
    if (value) {
      setCategory(value as Category | 'ALL');
      setPage(1);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProduct.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <Button render={<Link to="/admin/products/new" />}>
          새 상품 등록
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="전체 카테고리" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 카테고리</SelectItem>
            {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="상품명 검색"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-xs"
        />
        <Button variant="outline" onClick={handleSearch}>
          검색
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">이미지</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead className="w-24">카테고리</TableHead>
              <TableHead className="w-28 text-right">가격</TableHead>
              <TableHead className="w-28 text-right">할인가</TableHead>
              <TableHead className="w-20 text-center">상태</TableHead>
              <TableHead className="w-28">등록일</TableHead>
              <TableHead className="w-28 text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  로딩 중...
                </TableCell>
              </TableRow>
            ) : !data?.items.length ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  등록된 상품이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                        없음
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{CATEGORY_LABELS[product.category]}</TableCell>
                  <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                  <TableCell className="text-right">
                    {product.salePrice ? formatPrice(product.salePrice) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={STATUS_VARIANTS[product.status]}>
                      {STATUS_LABELS[product.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(product.createdAt)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="sm" render={<Link to={`/admin/products/${product.id}/edit`} />}>
                        수정
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(product)}
                      >
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            이전
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상품 삭제</DialogTitle>
            <DialogDescription>
              "{deleteTarget?.name}" 상품을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
