import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CART_QUERY_KEY } from "../../cart";
import * as orderService from "../services/order.service";

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderService.checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
}
