import { useQuery } from "@tanstack/react-query";
import * as catalogService from "../services/catalog.service";

export function useCategories() {
  return useQuery({
    queryKey: ["catalog", "categories"] as const,
    queryFn: catalogService.getCategories,
    staleTime: 5 * 60 * 1000,
  });
}
