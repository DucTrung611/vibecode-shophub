import type { Prisma } from '../../../../generated/prisma/client';

export const ORDER_LIST_INCLUDE = {
  items: true,
} satisfies Prisma.OrderInclude;

export const ORDER_DETAIL_INCLUDE = {
  items: true,
  payments: true,
  shipments: true,
} satisfies Prisma.OrderInclude;

export type OrderListItem = Prisma.OrderGetPayload<{
  include: typeof ORDER_LIST_INCLUDE;
}>;

export type OrderDetail = Prisma.OrderGetPayload<{
  include: typeof ORDER_DETAIL_INCLUDE;
}>;
