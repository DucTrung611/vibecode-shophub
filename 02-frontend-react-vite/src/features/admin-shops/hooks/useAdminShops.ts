import { useQuery } from "@tanstack/react-query";
import * as adminShopsService from "../services/admin-shops.service";
import type { ListShopsParams } from "../types/admin-shops.types";

export function useAdminShops(params: ListShopsParams) {
  return useQuery({
    queryKey: ["admin-shops", params],
    queryFn: () => adminShopsService.listShops(params),
    placeholderData: (previous) => previous,
  });
}
