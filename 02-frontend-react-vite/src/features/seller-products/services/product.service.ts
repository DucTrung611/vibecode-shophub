import { apiClient, rawApiClient } from "../../../shared/services/api-client";
import type { ApiSuccess, PaginatedMeta } from "../../../shared/types/api-response.types";
import type {
  ProductDetail,
  ProductImage,
  ProductListItem,
  ProductStatus,
} from "../types/product.types";

export interface ProductListParams {
  shopId: number;
  categoryId?: number;
  status?: ProductStatus | "all";
  page?: number;
  limit?: number;
}

export async function getShopProducts(
  params: ProductListParams,
): Promise<{ products: ProductListItem[]; meta: PaginatedMeta }> {
  const { shopId, categoryId, status, page = 1, limit = 20 } = params;
  const query: Record<string, unknown> = { shopId, page, limit };
  if (categoryId) {
    query.categoryId = categoryId;
  }
  if (status && status !== "all") {
    query.status = status;
  }
  const response = await rawApiClient.get("/products", { params: query });
  const envelope = response as unknown as ApiSuccess<ProductListItem[]>;
  return {
    products: envelope.data,
    meta: envelope.meta ?? { page, limit, total: envelope.data.length },
  };
}

// The API only exposes a single-product read by slug (GET /products/:slug), not
// by id — see API_SPEC.md §6 (catalog). The product edit route is therefore
// keyed by `:slug` (not `:id`); the numeric id needed for PATCH/DELETE/variant
// mutations is read off the fetched detail payload.
export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const response = await apiClient.get(`/products/${slug}`);
  return response as unknown as ProductDetail;
}

export async function createProduct(payload: {
  name: string;
  categoryId: number;
}): Promise<ProductDetail> {
  const response = await apiClient.post("/products", payload);
  return response as unknown as ProductDetail;
}

export async function updateProduct(
  id: number,
  payload: { name?: string; categoryId?: number; status?: ProductStatus },
): Promise<ProductDetail> {
  const response = await apiClient.patch(`/products/${id}`, payload);
  return response as unknown as ProductDetail;
}

export async function deactivateProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

export async function uploadProductImages(
  productId: number,
  files: File[],
): Promise<ProductImage[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file);
  }
  const response = await apiClient.post(`/products/${productId}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response as unknown as ProductImage[];
}
