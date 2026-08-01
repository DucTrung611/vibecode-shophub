import { useQuery } from "@tanstack/react-query";
import * as catalogService from "../services/catalog.service";
import type { ProductListFilters } from "../types/catalog.types";

export function useProducts(filters: ProductListFilters) {
  return useQuery({
    queryKey: ["catalog", "products", filters] as const,
    queryFn: () => catalogService.getProducts(filters),
    staleTime: 5 * 60 * 1000,
  });
}
