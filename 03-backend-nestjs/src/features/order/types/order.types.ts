export type OrderStatusValue =
  'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export const ORDER_STATUS_TRANSITIONS: Record<
  OrderStatusValue,
  OrderStatusValue[]
> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export interface OrderListFilters {
  page: number;
  limit: number;
  status?: OrderStatusValue;
}
