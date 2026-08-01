import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "../../../shared/stores/session.store";
import * as voucherService from "../services/voucher.service";

export function useVouchers() {
  const accessToken = useSessionStore((state) => state.accessToken);
  return useQuery({
    queryKey: ["vouchers", "list"] as const,
    queryFn: voucherService.getVouchers,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
  });
}
