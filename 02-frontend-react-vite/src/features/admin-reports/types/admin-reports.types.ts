export interface ReportKpi {
  label: string;
  value: string | number;
}

export interface WeeklyPoint {
  label: string;
  value: number;
}

export interface CategoryBreakdown {
  categoryId: number;
  name: string;
  count: number;
}

export interface TopSeller {
  id: number;
  name: string;
}

export interface RevenueReport {
  kpis: ReportKpi[];
  weeklyBars: WeeklyPoint[];
  categoryBreakdown: CategoryBreakdown[];
  topSellers: TopSeller[];
}

export interface CarrierPerformance {
  carrier: string;
  totalShipments: number;
  delivered: number;
  deliveryRate: number;
}
