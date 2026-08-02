import type { Prisma } from '../../../../generated/prisma/client';

export const CART_ITEM_DETAIL_INCLUDE = {
  variant: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          shopId: true,
          shop: { select: { name: true } },
          images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
        },
      },
    },
  },
} satisfies Prisma.CartItemInclude;

export type CartItemDetail = Prisma.CartItemGetPayload<{
  include: typeof CART_ITEM_DETAIL_INCLUDE;
}>;
