import { apiClient } from "../../../shared/services/api-client";
import type {
  CarrierPerformance,
  RevenueReport,
  WeeklyPoint,
} from "../types/admin-reports.types";

export async function getRevenueReport(): Promise<RevenueReport> {
  const response = await apiClient.get("/admin/reports/revenue");
  return response as unknown as RevenueReport;
}

// This endpoint's `data` is a plain array (not `{items, meta}`), so `meta` is null and
// apiClient's interceptor just returns the array as-is.
export async function getUserSignupReport(): Promise<WeeklyPoint[]> {
  const response = await apiClient.get("/admin/reports/users");
  return response as unknown as WeeklyPoint[];
}

export async function getOrderOpsReport(): Promise<CarrierPerformance[]> {
  const response = await apiClient.get("/admin/reports/orders");
  return response as unknown as CarrierPerformance[];
}
