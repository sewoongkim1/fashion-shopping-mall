import { z } from 'zod';

const Category = z.enum(['TOP', 'BOTTOM', 'OUTER', 'DRESS', 'SHOES', 'BAG', 'ACCESSORY']);
const ProductStatus = z.enum(['ACTIVE', 'SOLDOUT', 'HIDDEN']);

const productImageSchema = z.object({
  url: z.string().min(1, '이미지 URL을 입력해주세요.'),
  sortOrder: z.number().int().min(0).default(0),
});

const productOptionSchema = z.object({
  color: z.string().min(1, '컬러를 입력해주세요.'),
  size: z.string().min(1, '사이즈를 입력해주세요.'),
  stock: z.number().int().min(0, '재고는 0 이상이어야 합니다.').default(0),
});

export const createProductSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요.'),
  description: z.string().min(1, '상품 설명을 입력해주세요.'),
  price: z.number().int().min(0, '가격은 0 이상이어야 합니다.'),
  salePrice: z.number().int().min(0, '할인가는 0 이상이어야 합니다.').nullable().optional(),
  category: Category,
  status: ProductStatus.optional().default('ACTIVE'),
  images: z.array(productImageSchema).optional().default([]),
  options: z.array(productOptionSchema).optional().default([]),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요.').optional(),
  description: z.string().min(1, '상품 설명을 입력해주세요.').optional(),
  price: z.number().int().min(0, '가격은 0 이상이어야 합니다.').optional(),
  salePrice: z.number().int().min(0, '할인가는 0 이상이어야 합니다.').nullable().optional(),
  category: Category.optional(),
  status: ProductStatus.optional(),
  images: z.array(productImageSchema).optional(),
  options: z.array(productOptionSchema).optional(),
});

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: Category.optional(),
  search: z.string().optional(),
  sort: z.enum(['latest', 'price_asc', 'price_desc', 'name']).optional().default('latest'),
  status: ProductStatus.optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
