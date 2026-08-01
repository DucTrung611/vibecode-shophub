export const ORDER_CREATED = 'order.created';
export const ORDER_STATUS_UPDATED = 'order.status.updated';

export interface OrderCreatedEvent {
  orderId: number;
  buyerId: number;
  shopId: number;
  orderCode: string;
  totalAmount: number;
}

export interface OrderStatusUpdatedEvent {
  orderId: number;
  buyerId: number;
  status: string;
  updatedAt: string;
}
