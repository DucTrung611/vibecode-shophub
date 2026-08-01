import { apiClient } from "../../../shared/services/api-client";
import type { ApiResult } from "../../../shared/types/api-response.types";
import type { Review } from "../types/review.types";

export async function getProductReviews(
  productId: number,
  page = 1,
  limit = 20,
): Promise<{ items: Review[]; total: number }> {
  const result = (await apiClient.get(`/products/${productId}/reviews`, {
    params: { page, limit },
  })) as unknown as ApiResult<Review[]>;
  return { items: result.data, total: result.meta?.total ?? result.data.length };
}
