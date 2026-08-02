import { useQuery } from "@tanstack/react-query";
import { getInventorySummary } from "../services/inventory.service";
import type { InventoryStatusFilter } from "../types/inventory.types";

export const inventoryKeys = {
  summary: (status: InventoryStatusFilter) => ["seller-inventory", "summary", status] as const,
};

export function useInventorySummary(status: InventoryStatusFilter) {
  return useQuery({
    queryKey: inventoryKeys.summary(status),
    queryFn: () => getInventorySummary(status),
  });
}
