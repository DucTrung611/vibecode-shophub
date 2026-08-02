import { useQuery } from "@tanstack/react-query";
import * as adminShopsService from "../services/admin-shops.service";

export function useAdminShopDetail(id: number) {
  return useQuery({
    queryKey: ["admin-shops", "detail", id],
    queryFn: () => adminShopsService.getShopDetail(id),
    enabled: Number.isFinite(id),
  });
}
