import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  PRODUCT_DETAIL_INCLUDE,
  PRODUCT_LIST_INCLUDE,
  ProductDetail,
  ProductListItem,
  ProductWithShopOwner,
} from './entities/product.entity';

export interface ProductListFilters {
  page: number;
  limit: number;
  categoryId?: number;
  shopId?: number;
  status?: 'draft' | 'active' | 'inactive';
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'createdAt' | 'soldCount' | 'ratingAvg';
  order: 'asc' | 'desc';
}

export interface CreateProductData {
  shopId: number;
  categoryId: number;
  name: string;
  slug: string;
}

export interface UpdateProductData {
  name?: string;
  categoryId?: number;
  status?: 'draft' | 'active' | 'inactive';
}

export interface CreateVariantData {
  productId: number;
  sku: string;
  attributes: object;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
}

export interface UpdateVariantData {
  price?: number;
  compareAtPrice?: number;
  stockQuantity?: number;
}

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filters: ProductListFilters) {
    const priceFilter =
      filters.minPrice !== undefined || filters.maxPrice !== undefined
        ? {
            variants: {
              some: {
                price: {
                  ...(filters.minPrice !== undefined
                    ? { gte: filters.minPrice }
                    : {}),
                  ...(filters.maxPrice !== undefined
                    ? { lte: filters.maxPrice }
                    : {}),
                },
              },
            },
          }
        : {};

    return {
      ...(filters.categoryId !== undefined
        ? { categoryId: filters.categoryId }
        : {}),
      ...(filters.shopId !== undefined ? { shopId: filters.shopId } : {}),
      ...(filters.status !== undefined ? { status: filters.status } : {}),
      ...priceFilter,
    };
  }

  async findMany(
    filters: ProductListFilters,
  ): Promise<{ items: ProductListItem[]; total: number }> {
    const where = this.buildWhere(filters);
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_LIST_INCLUDE,
        orderBy: { [filters.sortBy]: filters.order },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total };
  }

  findBySlug(slug: string): Promise<ProductDetail | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_DETAIL_INCLUDE,
    });
  }

  findByIdWithOwner(id: number): Promise<ProductWithShopOwner | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: { shop: { select: { ownerId: true } } },
    });
  }

  create(data: CreateProductData) {
    return this.prisma.product.create({ data: { ...data, status: 'draft' } });
  }

  update(id: number, data: UpdateProductData) {
    return this.prisma.product.update({ where: { id }, data });
  }

  deactivate(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'inactive' },
    });
  }

  createVariant(data: CreateVariantData) {
    return this.prisma.productVariant.create({ data });
  }

  findVariantWithOwner(variantId: number) {
    return this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: { include: { shop: { select: { ownerId: true } } } },
      },
    });
  }

  updateVariant(variantId: number, data: UpdateVariantData) {
    return this.prisma.productVariant.update({
      where: { id: variantId },
      data,
    });
  }
}
