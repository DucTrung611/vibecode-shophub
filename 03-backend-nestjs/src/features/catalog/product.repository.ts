import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/database/prisma.service';
import { CatalogPort, CatalogVariantForCart } from './catalog.port';
import { VARIANT_STOCK_CHANGED } from './catalog.events';
import {
  FlaggedProductItem,
  PRODUCT_DETAIL_INCLUDE,
  PRODUCT_FLAGGED_INCLUDE,
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
export class ProductRepository implements CatalogPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

  async createImages(productId: number, urls: string[]) {
    const existingCount = await this.prisma.productImage.count({
      where: { productId },
    });
    return this.prisma.productImage.createManyAndReturn({
      data: urls.map((url, index) => ({
        productId,
        url,
        sortOrder: existingCount + index,
      })),
    });
  }

  findVariantWithOwner(variantId: number) {
    return this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: { include: { shop: { select: { ownerId: true } } } },
      },
    });
  }

  async updateVariant(variantId: number, data: UpdateVariantData) {
    const variant = await this.prisma.productVariant.update({
      where: { id: variantId },
      data,
    });
    if (data.stockQuantity !== undefined) {
      this.eventEmitter.emit(VARIANT_STOCK_CHANGED, {
        variantId: variant.id,
        stockQuantity: variant.stockQuantity,
      });
    }
    return variant;
  }

  async getVariantForCart(
    variantId: number,
  ): Promise<CatalogVariantForCart | null> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { name: true } } },
    });
    if (!variant) return null;
    return {
      id: variant.id,
      productId: variant.productId,
      productName: variant.product.name,
      attributes: variant.attributes,
      price: variant.price.toString(),
      stockQuantity: variant.stockQuantity,
    };
  }

  async decrementVariantStock(
    variantId: number,
    quantity: number,
  ): Promise<void> {
    const variant = await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity: { decrement: quantity } },
    });
    this.eventEmitter.emit(VARIANT_STOCK_CHANGED, {
      variantId: variant.id,
      stockQuantity: variant.stockQuantity,
    });
  }

  async incrementProductSoldCount(
    productId: number,
    quantity: number,
  ): Promise<void> {
    await this.prisma.product.update({
      where: { id: productId },
      data: { soldCount: { increment: quantity } },
    });
  }

  async updateProductRating(
    productId: number,
    ratingAvg: number,
  ): Promise<void> {
    await this.prisma.product.update({
      where: { id: productId },
      data: { ratingAvg },
    });
  }

  async findFlagged(
    page: number,
    limit: number,
  ): Promise<{ items: FlaggedProductItem[]; total: number }> {
    const where = { status: 'flagged' as const };
    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_FLAGGED_INCLUDE,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total };
  }

  countFlaggedProducts(): Promise<number> {
    return this.prisma.product.count({ where: { status: 'flagged' } });
  }

  async getTopCategories(limit: number) {
    const grouped = await this.prisma.product.groupBy({
      by: ['categoryId'],
      _count: { _all: true },
      orderBy: { _count: { categoryId: 'desc' } },
      take: limit,
    });
    const categories = await this.prisma.category.findMany({
      where: { id: { in: grouped.map((g) => g.categoryId) } },
    });
    const nameById = new Map(categories.map((c) => [c.id, c.name]));
    return grouped.map((g) => ({
      categoryId: g.categoryId,
      name: nameById.get(g.categoryId) ?? 'Unknown',
      count: g._count._all,
    }));
  }

  async moderate(
    productId: number,
    adminId: number,
    action: 'approve' | 'request_changes' | 'remove',
    note: string | undefined,
  ) {
    const status =
      action === 'approve'
        ? ('active' as const)
        : action === 'remove'
          ? ('inactive' as const)
          : ('flagged' as const);

    const [product] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id: productId },
        data: {
          status,
          flagReason: action === 'request_changes' ? (note ?? null) : null,
          moderatedAt: new Date(),
          moderatedBy: adminId,
        },
      }),
      this.prisma.productModerationLog.create({
        data: { productId, adminId, action, note },
      }),
    ]);
    return product;
  }

  async getShopProductStats(shopId: number) {
    const [totalListings, topProducts] = await Promise.all([
      this.prisma.product.count({ where: { shopId } }),
      this.prisma.product.findMany({
        where: { shopId },
        orderBy: { soldCount: 'desc' },
        take: 5,
        select: { id: true, name: true, soldCount: true },
      }),
    ]);
    return { totalListings, topProducts };
  }

  async getInventorySummary(
    shopId: number,
    status?: 'in_stock' | 'low_stock' | 'out_of_stock',
  ) {
    const LOW_STOCK_THRESHOLD = 10;
    const variants = await this.prisma.productVariant.findMany({
      where: { product: { shopId } },
      include: { product: { select: { name: true, status: true } } },
      orderBy: { stockQuantity: 'asc' },
    });

    const withStatus = variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      productName: v.product.name,
      attributes: v.attributes,
      stockQuantity: v.stockQuantity,
      reserved: 0,
      available: v.stockQuantity,
      stockStatus:
        v.stockQuantity === 0
          ? ('out_of_stock' as const)
          : v.stockQuantity <= LOW_STOCK_THRESHOLD
            ? ('low_stock' as const)
            : ('in_stock' as const),
    }));

    const totalSkus = withStatus.length;
    const outOfStock = withStatus.filter(
      (v) => v.stockStatus === 'out_of_stock',
    ).length;
    const lowStock = withStatus.filter(
      (v) => v.stockStatus === 'low_stock',
    ).length;
    const items = status
      ? withStatus.filter((v) => v.stockStatus === status)
      : withStatus;

    return { totalSkus, outOfStock, lowStock, items };
  }
}
