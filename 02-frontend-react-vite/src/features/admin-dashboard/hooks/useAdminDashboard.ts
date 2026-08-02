import { useQuery } from "@tanstack/react-query";
import * as adminDashboardService from "../services/admin-dashboard.service";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminDashboardService.getDashboard,
  });
}
