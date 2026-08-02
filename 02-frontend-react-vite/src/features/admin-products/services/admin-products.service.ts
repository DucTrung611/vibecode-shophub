import { apiClient } from "../../../shared/services/api-client";
import { rawApiClient } from "../../../shared/services/raw-api-client";
import type { ApiSuccess, PaginatedMeta } from "../../../shared/types/api-response.types";
import type {
  FlaggedProduct,
  ListFlaggedProductsParams,
  ModerateProductPayload,
} from "../types/admin-products.types";

export async function listFlaggedProducts(
  params: ListFlaggedProductsParams,
): Promise<{ items: FlaggedProduct[]; meta: PaginatedMeta }> {
  const response = await rawApiClient.get("/admin/products", { params });
  const body = response as unknown as ApiSuccess<FlaggedProduct[]>;
  return { items: body.data, meta: body.meta as PaginatedMeta };
}

export async function moderateProduct(
  id: number,
  payload: ModerateProductPayload,
): Promise<FlaggedProduct> {
  const response = await apiClient.patch(`/admin/products/${id}/moderate`, payload);
  return response as unknown as FlaggedProduct;
}
