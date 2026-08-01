import { apiClient } from "../../../shared/services/api-client";
import type { ApiResult } from "../../../shared/types/api-response.types";
import type { WishlistItem } from "../types/wishlist.types";

export async function getWishlist(): Promise<WishlistItem[]> {
  const result = (await apiClient.get(
    "/wishlist",
  )) as unknown as ApiResult<WishlistItem[]>;
  return result.data;
}

export async function addWishlistItem(productId: number): Promise<WishlistItem> {
  const result = (await apiClient.post("/wishlist", {
    productId,
  })) as unknown as ApiResult<WishlistItem>;
  return result.data;
}

export async function removeWishlistItem(productId: number): Promise<void> {
  await apiClient.delete(`/wishlist/${productId}`);
}
