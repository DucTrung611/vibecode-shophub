import type { Prisma } from '../../../../generated/prisma/client';

export interface ProductEntity {
  id: number;
  shopId: number;
  categoryId: number;
  name: string;
  slug: string;
  status: 'draft' | 'active' | 'inactive';
  ratingAvg: Prisma.Decimal;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export const PRODUCT_DETAIL_INCLUDE = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: true,
  shop: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductInclude;

export const PRODUCT_LIST_INCLUDE = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
  variants: true,
} satisfies Prisma.ProductInclude;

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_DETAIL_INCLUDE;
}>;

export type ProductListItem = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_LIST_INCLUDE;
}>;

export type ProductWithShopOwner = Prisma.ProductGetPayload<{
  include: { shop: { select: { ownerId: true } } };
}>;
