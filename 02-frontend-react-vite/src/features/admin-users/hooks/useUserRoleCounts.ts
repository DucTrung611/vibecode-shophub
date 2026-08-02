import { useQuery } from "@tanstack/react-query";
import * as adminUsersService from "../services/admin-users.service";
import type { UserRole } from "../types/admin-users.types";

const ROLES: UserRole[] = ["buyer", "seller", "admin"];

/**
 * There's no dedicated "role counts" endpoint — `GET /admin/users` is paginated
 * per-role via the `role` filter, and its `meta.total` already gives an exact count
 * for that role. Fetching `limit=1` per role (3 tiny requests) reads that total
 * without a backend change, instead of paging through every user client-side.
 */
export function useUserRoleCounts() {
  return useQuery({
    queryKey: ["admin-users", "role-counts"],
    queryFn: async () => {
      const results = await Promise.all(
        ROLES.map((role) => adminUsersService.listUsers({ page: 1, limit: 1, role })),
      );
      return Object.fromEntries(
        ROLES.map((role, index) => [role, results[index].meta.total]),
      ) as Record<UserRole, number>;
    },
    staleTime: 60 * 1000,
  });
}
