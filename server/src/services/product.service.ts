import prisma from '../lib/prisma';
import { AppError } from '../lib/AppError';
import type { CreateProductInput, UpdateProductInput, ProductListQuery } from '../validations/product.validation';
import type { PaginatedResponse } from '../types';

export class ProductService {
  async create(input: CreateProductInput) {
    const { images, options, ...productData } = input;

    const product = await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: images,
        },
        options: {
          create: options,
        },
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        options: true,
      },
    });

    return product;
  }

  async findAll(query: ProductListQuery): Promise<PaginatedResponse<any>> {
    const { page, limit, category, search, sort, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = (() => {
      switch (sort) {
        case 'price_asc': return { price: 'asc' };
        case 'price_desc': return { price: 'desc' };
        case 'name': return { name: 'asc' };
        case 'latest':
        default: return { createdAt: 'desc' };
      }
    })();

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          options: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        options: true,
      },
    });

    if (!product || product.isDeleted) {
      throw AppError.notFound('상품을 찾을 수 없습니다.');
    }

    return product;
  }

  async update(id: string, input: UpdateProductInput) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw AppError.notFound('상품을 찾을 수 없습니다.');
    }

    const { images, options, ...productData } = input;

    const product = await prisma.$transaction(async (tx) => {
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img) => ({ ...img, productId: id })),
          });
        }
      }

      if (options !== undefined) {
        await tx.productOption.deleteMany({ where: { productId: id } });
        if (options.length > 0) {
          await tx.productOption.createMany({
            data: options.map((opt) => ({ ...opt, productId: id })),
          });
        }
      }

      return tx.product.update({
        where: { id },
        data: productData,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          options: true,
        },
      });
    });

    return product;
  }

  async delete(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.isDeleted) {
      throw AppError.notFound('상품을 찾을 수 없습니다.');
    }

    await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}

export const productService = new ProductService();
