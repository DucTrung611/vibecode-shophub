import { apiClient } from "../../../shared/services/api-client";
import type { InventoryStatusFilter, InventorySummary } from "../types/inventory.types";

export async function getInventorySummary(
  status: InventoryStatusFilter,
): Promise<InventorySummary> {
  const params = status === "all" ? undefined : { status };
  const response = await apiClient.get("/shops/me/inventory/summary", { params });
  return response as unknown as InventorySummary;
}
