import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "../../../shared/stores/session.store";
import * as wishlistService from "../services/wishlist.service";

export const WISHLIST_QUERY_KEY = ["wishlist"] as const;

export function useWishlist() {
  const accessToken = useSessionStore((state) => state.accessToken);
  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: wishlistService.getWishlist,
    enabled: Boolean(accessToken),
  });
}
