import { apiClient } from "../../../shared/services/api-client";
import type {
  CategoryTreeNode,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/admin-categories.types";

export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const response = await apiClient.get("/categories");
  return response as unknown as CategoryTreeNode[];
}

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<CategoryTreeNode> {
  const response = await apiClient.post("/categories", payload);
  return response as unknown as CategoryTreeNode;
}

export async function updateCategory(
  id: number,
  payload: UpdateCategoryPayload,
): Promise<CategoryTreeNode> {
  const response = await apiClient.patch(`/categories/${id}`, payload);
  return response as unknown as CategoryTreeNode;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
