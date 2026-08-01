import { Button } from "../../../shared/components/Button";
import { formatPrice } from "../../../shared/utils/format-price";

interface CartSummaryBarProps {
  total: number;
  selectedCount: number;
  disabled: boolean;
  onCheckout: () => void;
}

export function CartSummaryBar({
  total,
  selectedCount,
  disabled,
  onCheckout,
}: CartSummaryBarProps) {
  return (
    <div className="sticky bottom-16 z-30 flex items-center justify-between border-t border-neutral-100 bg-white px-4 py-3 md:bottom-0">
      <div>
        <p className="text-xs text-neutral-500 font-manrope">
          Tổng cộng ({selectedCount} sản phẩm)
        </p>
        <p className="text-lg font-bold font-sora text-hub-600">{formatPrice(total)}</p>
      </div>
      <div className="w-40">
        <Button type="button" disabled={disabled} onClick={onCheckout}>
          Thanh toán
        </Button>
      </div>
    </div>
  );
}
