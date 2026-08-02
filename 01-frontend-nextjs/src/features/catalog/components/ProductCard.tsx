import Link from "next/link";
import { WishlistButton } from "../../../features/wishlist";
import { getAssetUrl } from "../../../shared/utils/asset-url";
import { formatPrice } from "../../../shared/utils/format-price";
import type { ProductListItem } from "../types/catalog.types";

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const cheapestVariant = product.variants.reduce<
    ProductListItem["variants"][number] | null
  >(
    (min, variant) =>
      !min || Number(variant.price) < Number(min.price) ? variant : min,
    null,
  );
  const price = cheapestVariant ? Number(cheapestVariant.price) : 0;
  const compareAt = cheapestVariant?.compareAtPrice
    ? Number(cheapestVariant.compareAtPrice)
    : null;
  const discountPercent =
    compareAt && compareAt > price
      ? Math.round((1 - price / compareAt) * 100)
      : null;
  const thumbnail = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-shadow hover:shadow-md"
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
        {discountPercent !== null && (
          <span className="absolute left-2 top-2 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{discountPercent}%
          </span>
        )}
        <WishlistButton productId={product.id} className="absolute right-2 top-2" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-manrope text-neutral-900">
          {product.name}
        </h3>
        <div className="mt-auto flex items-baseline gap-1.5">
          <span className="text-base font-bold font-sora text-hub-600">
            {formatPrice(price)}
          </span>
          {compareAt !== null && compareAt > price && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(compareAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-500 font-manrope">
          <span>⭐ {Number(product.ratingAvg).toFixed(1)}</span>
          <span>·</span>
          <span>Đã bán {product.soldCount}</span>
        </div>
      </div>
    </Link>
  );
}
