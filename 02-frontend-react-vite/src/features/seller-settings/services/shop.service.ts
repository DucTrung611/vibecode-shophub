import { apiClient } from "../../../shared/services/api-client";
import type { Shop } from "../types/shop.types";

// The API only exposes `PATCH /shops/me` for the authenticated seller's own shop —
// there is no `GET /shops/me`. Sending an empty body is a harmless no-op update
// (every field in the PATCH DTO is optional) and it still returns the current shop,
// so we reuse it to resolve "my shop" (id, name, slug) for prefilling this settings
// form and for seller-products to resolve its own `shopId` for `GET /products?shopId=`.
export async function getMyShop(): Promise<Shop> {
  const response = await apiClient.patch("/shops/me", {});
  return response as unknown as Shop;
}

export async function updateMyShop(payload: { name: string }): Promise<Shop> {
  const response = await apiClient.patch("/shops/me", payload);
  return response as unknown as Shop;
}
