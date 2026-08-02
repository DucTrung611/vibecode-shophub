import { useQuery } from "@tanstack/react-query";
import * as adminProductsService from "../services/admin-products.service";
import type { ListFlaggedProductsParams } from "../types/admin-products.types";

export function useFlaggedProducts(params: ListFlaggedProductsParams) {
  return useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => adminProductsService.listFlaggedProducts(params),
    placeholderData: (previous) => previous,
  });
}
