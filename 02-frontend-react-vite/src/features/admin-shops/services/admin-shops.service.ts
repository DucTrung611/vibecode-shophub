import { apiClient } from "../../../shared/services/api-client";
import { rawApiClient } from "../../../shared/services/raw-api-client";
import type { ApiSuccess, PaginatedMeta } from "../../../shared/types/api-response.types";
import type {
  AdminShop,
  ListShopsParams,
  UpdateShopStatusPayload,
} from "../types/admin-shops.types";

export async function listShops(
  params: ListShopsParams,
): Promise<{ items: AdminShop[]; meta: PaginatedMeta }> {
  const response = await rawApiClient.get("/admin/shops", { params });
  const body = response as unknown as ApiSuccess<AdminShop[]>;
  return { items: body.data, meta: body.meta as PaginatedMeta };
}

export async function getShopDetail(id: number): Promise<AdminShop> {
  const response = await apiClient.get(`/admin/shops/${id}`);
  return response as unknown as AdminShop;
}

export async function updateShopStatus(
  id: number,
  payload: UpdateShopStatusPayload,
): Promise<AdminShop> {
  const response = await apiClient.patch(`/admin/shops/${id}/status`, payload);
  return response as unknown as AdminShop;
}
