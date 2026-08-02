import { apiClient } from "../../../shared/services/api-client";
import type { ProductVariant } from "../types/product.types";

export interface VariantCreatePayload {
  sku: string;
  attributes: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
}

export interface VariantUpdatePayload {
  price?: number;
  compareAtPrice?: number;
  stockQuantity?: number;
}

export async function createVariant(
  productId: number,
  payload: VariantCreatePayload,
): Promise<ProductVariant> {
  const response = await apiClient.post(`/products/${productId}/variants`, payload);
  return response as unknown as ProductVariant;
}

export async function updateVariant(
  productId: number,
  variantId: number,
  payload: VariantUpdatePayload,
): Promise<ProductVariant> {
  const response = await apiClient.patch(
    `/products/${productId}/variants/${variantId}`,
    payload,
  );
  return response as unknown as ProductVariant;
}
