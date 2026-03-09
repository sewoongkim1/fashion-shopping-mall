import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProduct, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { uploadApi } from '@/api/upload.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category, ProductStatus } from '@/types';

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'TOP', label: '상의' },
  { value: 'BOTTOM', label: '하의' },
  { value: 'OUTER', label: '아우터' },
  { value: 'DRESS', label: '원피스' },
  { value: 'SHOES', label: '신발' },
  { value: 'BAG', label: '가방' },
  { value: 'ACCESSORY', label: '액세서리' },
];

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'ACTIVE', label: '판매중' },
  { value: 'SOLDOUT', label: '품절' },
  { value: 'HIDDEN', label: '숨김' },
];

const productFormSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요.'),
  description: z.string().min(1, '상품 설명을 입력해주세요.'),
  price: z.coerce.number().int().min(0, '가격은 0 이상이어야 합니다.'),
  salePrice: z.coerce.number().int().min(0).nullable().optional(),
  category: z.enum(['TOP', 'BOTTOM', 'OUTER', 'DRESS', 'SHOES', 'BAG', 'ACCESSORY'] as const),
  status: z.enum(['ACTIVE', 'SOLDOUT', 'HIDDEN'] as const).optional().default('ACTIVE'),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface OptionRow {
  color: string;
  size: string;
  stock: number;
}

interface ImageRow {
  url: string;
  sortOrder: number;
}

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: product, isLoading } = useProduct(id ?? '');
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [options, setOptions] = useState<OptionRow[]>([]);
  const [images, setImages] = useState<ImageRow[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      salePrice: null,
      category: 'TOP',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (isEdit && product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice ?? null,
        category: product.category,
        status: product.status,
      });
      setOptions(product.options.map((o) => ({ color: o.color, size: o.size, stock: o.stock })));
      setImages(product.images.map((i) => ({ url: i.url, sortOrder: i.sortOrder })));
    }
  }, [isEdit, product, reset]);

  const onSubmit = (data: ProductFormValues) => {
    const payload = {
      ...data,
      salePrice: data.salePrice || null,
      images,
      options,
    };

    if (isEdit) {
      updateProduct.mutate(
        { id: id!, data: payload },
        { onSuccess: () => navigate('/admin/products') }
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => navigate('/admin/products'),
      });
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;
  const mutationError = createProduct.error || updateProduct.error;

  // Option management
  const addOption = () => setOptions([...options, { color: '', size: '', stock: 0 }]);
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index));
  const updateOption = (index: number, field: keyof OptionRow, value: string | number) => {
    setOptions(options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)));
  };

  // Image management
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newImages: ImageRow[] = [];
      for (const file of Array.from(files)) {
        const res = await uploadApi.uploadImage(file);
        newImages.push({ url: res.data.data!.url, sortOrder: images.length + newImages.length });
      }
      setImages([...images, ...newImages]);
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addImageByUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    setImages([...images, { url, sortOrder: images.length }]);
    setUrlInput('');
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, sortOrder: i })));
  };

  if (isEdit && isLoading) {
    return <div className="text-center text-muted-foreground">로딩 중...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isEdit ? '상품 수정' : '새 상품 등록'}</h1>
        <Button variant="outline" onClick={() => navigate('/admin/products')}>
          목록으로
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">상품명</Label>
              <Input id="name" placeholder="상품명 입력" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">상품 설명</Label>
              <Textarea
                id="description"
                placeholder="상품 설명 입력"
                rows={5}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>카테고리</Label>
                <Select value={watch('category')} onValueChange={(v) => setValue('category', v as Category)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>상태</Label>
                <Select value={watch('status')} onValueChange={(v) => setValue('status', v as ProductStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">가격 (원)</Label>
                <Input id="price" type="number" min={0} {...register('price')} />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">할인가 (원)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  min={0}
                  placeholder="할인가 없으면 비워두세요"
                  {...register('salePrice')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>이미지</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 업로드 / URL 입력 영역 */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                title="이미지 파일 선택"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? '업로드 중...' : '파일 업로드'}
              </Button>
              <span className="text-sm text-muted-foreground">또는</span>
              <Input
                placeholder="이미지 URL 입력"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImageByUrl(); } }}
                className="flex-1 min-w-[200px]"
              />
              <Button type="button" variant="outline" size="sm" onClick={addImageByUrl} disabled={!urlInput.trim()}>
                URL 추가
              </Button>
            </div>

            {/* 이미지 목록 */}
            {images.length === 0 && (
              <p className="text-sm text-muted-foreground">등록된 이미지가 없습니다.</p>
            )}
            {images.map((img, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5 text-center">{i + 1}</span>
                <img
                  src={img.url}
                  alt={`상품 이미지 ${i + 1}`}
                  className="h-16 w-16 rounded border object-cover"
                />
                <span className="flex-1 truncate text-sm text-muted-foreground">{img.url}</span>
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeImage(i)}>
                  삭제
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>옵션 (컬러/사이즈)</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                옵션 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {options.length === 0 && (
              <p className="text-sm text-muted-foreground">등록된 옵션이 없습니다.</p>
            )}
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <Input
                  placeholder="컬러"
                  value={opt.color}
                  onChange={(e) => updateOption(i, 'color', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="사이즈"
                  value={opt.size}
                  onChange={(e) => updateOption(i, 'size', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={0}
                  value={opt.stock}
                  onChange={(e) => updateOption(i, 'stock', Number(e.target.value))}
                  className="w-24"
                  placeholder="재고"
                />
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeOption(i)}>
                  삭제
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Error & Submit */}
        {mutationError && (
          <p className="text-sm text-destructive">
            {(mutationError as any)?.response?.data?.message || '저장에 실패했습니다.'}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            취소
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? '저장 중...' : isEdit ? '수정' : '등록'}
          </Button>
        </div>
      </form>
    </div>
  );
}
