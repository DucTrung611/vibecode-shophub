export const VOUCHER_PORT = Symbol('VOUCHER_PORT');

export interface VoucherValidationResult {
  voucherId: number;
  discountAmount: number;
}

export interface VoucherPort {
  validate(code: string, cartTotal: number): Promise<VoucherValidationResult>;
  markUsed(voucherId: number): Promise<void>;
}
