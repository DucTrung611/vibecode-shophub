import { useQuery } from "@tanstack/react-query";
import * as adminReportsService from "../services/admin-reports.service";

export function useRevenueReport() {
  return useQuery({
    queryKey: ["admin-reports", "revenue"],
    queryFn: adminReportsService.getRevenueReport,
  });
}

export function useUserSignupReport() {
  return useQuery({
    queryKey: ["admin-reports", "users"],
    queryFn: adminReportsService.getUserSignupReport,
  });
}

export function useOrderOpsReport() {
  return useQuery({
    queryKey: ["admin-reports", "orders"],
    queryFn: adminReportsService.getOrderOpsReport,
  });
}
