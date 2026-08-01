import { apiClient } from "../../../shared/services/api-client";
import type { ApiResult } from "../../../shared/types/api-response.types";
import type { Cart } from "../types/cart.types";

export async function getCart(): Promise<Cart> {
  const result = (await apiClient.get("/cart")) as unknown as ApiResult<Cart>;
  return result.data;
}

export async function addCartItem(variantId: number, quantity: number): Promise<Cart> {
  const result = (await apiClient.post("/cart/items", {
    variantId,
    quantity,
  })) as unknown as ApiResult<Cart>;
  return result.data;
}

export async function updateCartItem(itemId: number, quantity: number): Promise<Cart> {
  const result = (await apiClient.patch(`/cart/items/${itemId}`, {
    quantity,
  })) as unknown as ApiResult<Cart>;
  return result.data;
}

export async function removeCartItem(itemId: number): Promise<Cart> {
  const result = (await apiClient.delete(
    `/cart/items/${itemId}`,
  )) as unknown as ApiResult<Cart>;
  return result.data;
}
