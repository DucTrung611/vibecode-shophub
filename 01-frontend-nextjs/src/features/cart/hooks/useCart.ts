import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSessionStore } from "../../../shared/stores/session.store";
import * as cartService from "../services/cart.service";

export const CART_QUERY_KEY = ["cart"] as const;

export function useCart() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const setCartItemCount = useSessionStore((state) => state.setCartItemCount);

  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: cartService.getCart,
    staleTime: 0,
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    if (query.data) {
      setCartItemCount(
        query.data.items.reduce((sum, item) => sum + item.quantity, 0),
      );
    }
  }, [query.data, setCartItemCount]);

  return query;
}
