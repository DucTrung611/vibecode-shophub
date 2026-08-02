import { useQuery } from "@tanstack/react-query";
import { getSellerDashboard } from "../services/dashboard.service";

export const sellerDashboardKeys = {
  root: ["seller-dashboard"] as const,
};

export function useSellerDashboard() {
  return useQuery({
    queryKey: sellerDashboardKeys.root,
    queryFn: getSellerDashboard,
  });
}
