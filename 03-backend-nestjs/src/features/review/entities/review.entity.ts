import type { Prisma } from '../../../../generated/prisma/client';

export const REVIEW_WITH_PRODUCT_OWNER_INCLUDE = {
  product: { select: { shop: { select: { ownerId: true } } } },
} satisfies Prisma.ReviewInclude;

export type ReviewWithProductOwner = Prisma.ReviewGetPayload<{
  include: typeof REVIEW_WITH_PRODUCT_OWNER_INCLUDE;
}>;
