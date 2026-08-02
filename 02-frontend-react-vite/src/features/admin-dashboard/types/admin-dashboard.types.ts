export interface DashboardKpi {
  label: string;
  value: string | number;
  pendingCount?: number;
}

export interface WeeklyPoint {
  label: string;
  value: number;
}

export interface NeedsActionItem {
  label: string;
  count: number;
}

export interface NewShop {
  id: number;
  name: string;
  status: "pending" | "approved" | "suspended" | "rejected";
  createdAt: string;
}

export interface TopCategory {
  categoryId: number;
  name: string;
  count: number;
}

export interface AdminDashboardData {
  kpis: DashboardKpi[];
  gmvWeekly: WeeklyPoint[];
  needsAction: NeedsActionItem[];
  newShops: NewShop[];
  topCategories: TopCategory[];
}
