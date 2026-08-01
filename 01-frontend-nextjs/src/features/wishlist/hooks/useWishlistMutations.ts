import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as wishlistService from "../services/wishlist.service";
import { WISHLIST_QUERY_KEY } from "./useWishlist";

export function useAddWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.addWishlistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}

export function useRemoveWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.removeWishlistItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}
