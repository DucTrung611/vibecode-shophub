import { useQuery } from "@tanstack/react-query";
import * as orderService from "../services/order.service";
import type { OrderStatus } from "../types/order.types";

export const ORDERS_QUERY_KEY = ["orders"] as const;

export function useOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, "list", status] as const,
    queryFn: () => orderService.getOrders(status),
  });
}
