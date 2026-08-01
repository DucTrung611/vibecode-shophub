import type { Prisma } from '../../../../generated/prisma/client';

export const CART_ITEM_DETAIL_INCLUDE = {
  variant: {
    include: {
      product: {
        select: { id: true, name: true, slug: true, shopId: true },
      },
    },
  },
} satisfies Prisma.CartItemInclude;

export type CartItemDetail = Prisma.CartItemGetPayload<{
  include: typeof CART_ITEM_DETAIL_INCLUDE;
}>;
