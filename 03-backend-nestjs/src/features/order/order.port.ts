export const ORDER_PORT = Symbol('ORDER_PORT');

export interface OrderItemForReview {
  id: number;
  productId: number;
}

export interface OrderPort {
  findOrderItemForReview(
    orderItemId: number,
    userId: number,
  ): Promise<OrderItemForReview | null>;
}
