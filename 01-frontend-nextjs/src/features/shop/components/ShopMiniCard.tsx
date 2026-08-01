import Link from "next/link";
import type { ShopSummary } from "../types/shop.types";

interface ShopMiniCardProps {
  shop: ShopSummary;
}

export function ShopMiniCard({ shop }: ShopMiniCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-100 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hub-50 text-lg font-bold text-hub-600 font-sora">
          {shop.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-bold font-sora text-neutral-900">{shop.name}</p>
          <p className="text-xs text-neutral-500 font-manrope">
            ⭐ {Number(shop.ratingAvg).toFixed(1)} · Đã bán {shop.totalSold}
          </p>
        </div>
      </div>
      <Link
        href={`/shops/${shop.slug}`}
        className="rounded-lg border border-hub-500 px-3 py-1.5 text-xs font-bold font-manrope text-hub-600"
      >
        Xem shop
      </Link>
    </div>
  );
}
