export interface VoucherValidationResult {
  voucherId: number;
  discountAmount: number;
}

export interface VoucherListItem {
  id: number;
  shopId: number | null;
  code: string;
  type: "percentage" | "fixed_amount";
  value: string;
  minOrderAmount: string | null;
  maxDiscount: string | null;
  startsAt: string;
  endsAt: string;
}
