import { apiClient } from "../../../shared/services/api-client";
import type { ApiResult } from "../../../shared/types/api-response.types";
import type { ShopSummary } from "../types/shop.types";

export async function getShopBySlug(slug: string): Promise<ShopSummary> {
  const result = (await apiClient.get(
    `/shops/${slug}`,
  )) as unknown as ApiResult<ShopSummary>;
  return result.data;
}
