import Link from "next/link";
import { getAssetUrl } from "../../../shared/utils/asset-url";
import { formatPrice } from "../../../shared/utils/format-price";
import type { ProductListItem } from "../types/catalog.types";

interface ProductListRowProps {
  product: ProductListItem;
}

export function ProductListRow({ product }: ProductListRowProps) {
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
  const thumbnail = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-3 transition-shadow hover:shadow-md"
    >
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-hub-50 text-2xl">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getAssetUrl(thumbnail.url)} alt="" className="h-full w-full object-cover" />
        ) : (
          "📦"
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-manrope text-neutral-900">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-neutral-500 font-manrope">
          <span>⭐ {Number(product.ratingAvg).toFixed(1)}</span>
          <span>·</span>
          <span>Đã bán {product.soldCount}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-base font-bold font-sora text-hub-600">
          {formatPrice(price)}
        </span>
        {compareAt !== null && compareAt > price && (
          <span className="text-xs text-neutral-400 line-through">
            {formatPrice(compareAt)}
          </span>
        )}
      </div>
    </Link>
  );
}
