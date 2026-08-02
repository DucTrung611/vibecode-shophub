import { apiClient } from "../../../shared/services/api-client";
import type { SellerDashboard } from "../types/dashboard.types";

// apiClient's response interceptor unwraps { success, data, meta } down to `data`,
// so the declared generic here is the actual runtime resolved type — see
// shared/services/api-client.ts.
export async function getSellerDashboard(): Promise<SellerDashboard> {
  const response = await apiClient.get("/shops/me/dashboard");
  return response as unknown as SellerDashboard;
}
