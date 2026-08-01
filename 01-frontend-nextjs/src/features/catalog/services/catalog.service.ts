import { apiClient } from "../../../shared/services/api-client";
import type { ApiResult } from "../../../shared/types/api-response.types";
import type {
  Category,
  ProductDetail,
  ProductListFilters,
  ProductListItem,
  ProductListResult,
} from "../types/catalog.types";

export async function getCategories(): Promise<Category[]> {
  const result = (await apiClient.get("/categories")) as unknown as ApiResult<Category[]>;
  return result.data;
}

export async function getProducts(
  filters: ProductListFilters = {},
): Promise<ProductListResult> {
  const result = (await apiClient.get("/products", {
    params: filters,
  })) as unknown as ApiResult<ProductListItem[]>;
  return {
    items: result.data,
    total: result.meta?.total ?? result.data.length,
    page: result.meta?.page ?? filters.page ?? 1,
    limit: result.meta?.limit ?? filters.limit ?? 20,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const result = (await apiClient.get(
    `/products/${slug}`,
  )) as unknown as ApiResult<ProductDetail>;
  return result.data;
}
