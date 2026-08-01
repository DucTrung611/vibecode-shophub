import type { Prisma } from '../../../../generated/prisma/client';

export const WISHLIST_ITEM_INCLUDE = {
  product: {
    include: {
      images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
      variants: true,
      shop: { select: { id: true, name: true, slug: true } },
    },
  },
} satisfies Prisma.WishlistInclude;

export type WishlistItemDetail = Prisma.WishlistGetPayload<{
  include: typeof WISHLIST_ITEM_INCLUDE;
}>;
