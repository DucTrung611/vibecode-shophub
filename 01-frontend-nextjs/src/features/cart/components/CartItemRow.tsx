import { getAssetUrl } from "../../../shared/utils/asset-url";
import { formatPrice } from "../../../shared/utils/format-price";
import type { CartItem } from "../types/cart.types";

interface CartItemRowProps {
  item: CartItem;
  selected: boolean;
  onToggleSelect: (itemId: number) => void;
  onQuantityChange: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
}

export function CartItemRow({
  item,
  selected,
  onToggleSelect,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const insufficientStock = item.quantity > item.variant.stockQuantity;
  const attributesLabel = Object.values(item.variant.attributes).join(" / ");
  const thumbnail = item.variant.product.images[0];

  return (
    <div className="flex gap-3 border-b border-neutral-100 py-4 last:border-b-0">
      <input
        type="checkbox"
        checked={selected}
        disabled={insufficientStock}
        onChange={() => onToggleSelect(item.id)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 text-hub-500"
      />
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-hub-50 text-2xl">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getAssetUrl(thumbnail.url)} alt="" className="h-full w-full object-cover" />
        ) : (
          "📦"
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-manrope text-neutral-900">
          {item.variant.product.name}
        </p>
        {attributesLabel && (
          <p className="text-xs text-neutral-500 font-manrope">{attributesLabel}</p>
        )}
        {insufficientStock && (
          <p className="text-xs font-manrope text-error">
            Chỉ còn {item.variant.stockQuantity} sản phẩm trong kho
          </p>
        )}
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
              className="h-7 w-7 text-sm text-neutral-600"
            >
              −
            </button>
            <span className="w-8 text-center text-xs font-manrope">{item.quantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
              className="h-7 w-7 text-sm text-neutral-600"
            >
              +
            </button>
          </div>
          <span className="text-sm font-bold font-sora text-hub-600">
            {formatPrice(item.variant.price)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="w-fit text-xs text-neutral-400 underline"
        >
          Xóa
        </button>
      </div>
    </div>
  );
}
