import { useMutation } from "@tanstack/react-query";
import * as voucherService from "../services/voucher.service";

export function useValidateVoucher() {
  return useMutation({
    mutationFn: ({ code, cartTotal }: { code: string; cartTotal: number }) =>
      voucherService.validateVoucher(code, cartTotal),
  });
}
