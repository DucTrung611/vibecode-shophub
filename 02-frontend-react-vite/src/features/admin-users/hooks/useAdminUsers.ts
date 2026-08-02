import { useQuery } from "@tanstack/react-query";
import * as adminUsersService from "../services/admin-users.service";
import type { ListUsersParams } from "../types/admin-users.types";

export function useAdminUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => adminUsersService.listUsers(params),
    placeholderData: (previous) => previous,
  });
}
