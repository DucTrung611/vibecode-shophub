import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as orderService from "../services/order.service";
import { ORDERS_QUERY_KEY } from "./useOrders";

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}
