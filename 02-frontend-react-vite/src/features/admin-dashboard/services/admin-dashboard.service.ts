import { apiClient } from "../../../shared/services/api-client";
import type { AdminDashboardData } from "../types/admin-dashboard.types";

// apiClient's response interceptor unwraps { success, data, meta } down to `data` for
// single-resource endpoints — this one isn't paginated, so no `meta` is needed.
export async function getDashboard(): Promise<AdminDashboardData> {
  const response = await apiClient.get("/admin/dashboard");
  return response as unknown as AdminDashboardData;
}
