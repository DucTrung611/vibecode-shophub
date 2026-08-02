import { useQuery } from "@tanstack/react-query";
import { getMyShopOrders, type OrderListParams } from "../services/order.service";

export const orderKeys = {
  list: (params: OrderListParams) => ["seller-orders", "list", params] as const,
  detail: (id: number) => ["seller-orders", "detail", id] as const,
};

export function useSellerOrders(params: OrderListParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => getMyShopOrders(params),
  });
}
