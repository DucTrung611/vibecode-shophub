import { useQuery } from "@tanstack/react-query";
import * as orderService from "../services/order.service";
import { ORDERS_QUERY_KEY } from "./useOrders";

export function useOrder(id: number) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, "detail", id] as const,
    queryFn: () => orderService.getOrderById(id),
  });
}
