import { apiClient } from "../../../shared/services/api-client";
import { rawApiClient } from "../../../shared/services/raw-api-client";
import type { ApiSuccess, PaginatedMeta } from "../../../shared/types/api-response.types";
import type { AdminUser, ListUsersParams } from "../types/admin-users.types";

// rawApiClient resolves the FULL envelope ({ success, data, meta }) — used here because
// this is a paginated list endpoint and shared/components/Pagination.tsx needs `meta.total`.
export async function listUsers(
  params: ListUsersParams,
): Promise<{ items: AdminUser[]; meta: PaginatedMeta }> {
  const response = await rawApiClient.get("/admin/users", { params });
  const body = response as unknown as ApiSuccess<AdminUser[]>;
  return { items: body.data, meta: body.meta as PaginatedMeta };
}

export async function updateUserStatus(id: number, isActive: boolean): Promise<AdminUser> {
  const response = await apiClient.patch(`/admin/users/${id}/status`, { isActive });
  return response as unknown as AdminUser;
}
