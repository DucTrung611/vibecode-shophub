export const ORDER_PORT = Symbol('ORDER_PORT');

export interface OrderItemForReview {
  id: number;
  productId: number;
}

export interface RevenueBar {
  label: string;
  value: number;
}

export interface ShopOrderStats {
  todayRevenue: number;
  last7DaysRevenue: RevenueBar[];
  statusBreakdown: { status: string; count: number }[];
  cancelRate: number;
  totalOrders: number;
  recentOrders: {
    id: number;
    orderCode: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
  }[];
}

export interface PlatformOrderStats {
  totalOrders: number;
  gmv30d: number;
  gmvWeekly8: RevenueBar[];
}

export interface OrderPort {
  findOrderItemForReview(
    orderItemId: number,
    userId: number,
  ): Promise<OrderItemForReview | null>;
  getShopOrderStats(shopId: number): Promise<ShopOrderStats>;
  getPlatformOrderStats(): Promise<PlatformOrderStats>;
}
