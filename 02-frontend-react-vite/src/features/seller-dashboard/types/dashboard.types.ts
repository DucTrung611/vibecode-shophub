export interface DashboardKpi {
  label: string;
  value: number;
  pendingCount?: number;
}

export interface RevenueBar {
  label: string;
  value: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface RecentOrder {
  id: number;
  orderCode: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface TopProduct {
  id: number;
  name: string;
  soldCount: number;
}

export interface SellerDashboard {
  kpis: DashboardKpi[];
  revenueBars: RevenueBar[];
  orderStatusBreakdown: OrderStatusCount[];
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}
