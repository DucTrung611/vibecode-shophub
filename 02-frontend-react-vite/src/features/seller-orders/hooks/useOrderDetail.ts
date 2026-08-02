import { useQuery } from "@tanstack/react-query";
import { getOrderDetail } from "../services/order.service";
import { orderKeys } from "./useSellerOrders";

export function useOrderDetail(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrderDetail(id),
    enabled: Number.isFinite(id),
  });
}
