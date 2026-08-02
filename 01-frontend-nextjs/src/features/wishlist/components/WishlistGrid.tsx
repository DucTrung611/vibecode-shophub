import Link from "next/link";
import { getAssetUrl } from "../../../shared/utils/asset-url";
import { formatPrice } from "../../../shared/utils/format-price";
import type { WishlistItem } from "../types/wishlist.types";
import { WishlistButton } from "./WishlistButton";

interface WishlistGridProps {
  items: WishlistItem[];
}

export function WishlistGrid({ items }: WishlistGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
      {items.map((item) => {
        const cheapestVariant = item.product.variants.reduce<
          WishlistItem["product"]["variants"][number] | null
        >(
          (min, variant) =>
            !min || Number(variant.price) < Number(min.price) ? variant : min,
          null,
        );
        const outOfStock = item.product.variants.every(
          (variant) => variant.stockQuantity <= 0,
        );
        const thumbnail = item.product.images[0];
        return (
          <Link
            key={item.id}
            href={`/products/${item.product.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white"
          >
            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-hub-50 text-4xl">
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getAssetUrl(thumbnail.url)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                "📦"
              )}
              {outOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold text-white">
                  Hết hàng
                </div>
              )}
              <WishlistButton productId={item.productId} className="absolute right-2 top-2" />
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <h3 className="line-clamp-2 text-sm font-manrope text-neutral-900">
                {item.product.name}
              </h3>
              {cheapestVariant && (
                <span className="text-base font-bold font-sora text-hub-600">
                  {formatPrice(cheapestVariant.price)}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
