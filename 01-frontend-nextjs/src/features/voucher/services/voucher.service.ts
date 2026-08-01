import { apiClient } from "../../../shared/services/api-client";
import type { ApiResult } from "../../../shared/types/api-response.types";
import type { VoucherListItem, VoucherValidationResult } from "../types/voucher.types";

export async function getVouchers(): Promise<VoucherListItem[]> {
  const result = (await apiClient.get(
    "/vouchers",
  )) as unknown as ApiResult<VoucherListItem[]>;
  return result.data;
}

export async function validateVoucher(
  code: string,
  cartTotal: number,
): Promise<VoucherValidationResult> {
  const result = (await apiClient.post("/vouchers/validate", {
    code,
    cartTotal,
  })) as unknown as ApiResult<VoucherValidationResult>;
  return result.data;
}
