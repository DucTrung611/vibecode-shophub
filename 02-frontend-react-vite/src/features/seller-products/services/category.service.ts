import { apiClient } from "../../../shared/services/api-client";
import type { Category } from "../types/product.types";

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get("/categories");
  return response as unknown as Category[];
}
