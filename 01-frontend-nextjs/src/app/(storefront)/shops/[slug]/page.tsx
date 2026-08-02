import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogService } from "@/features/catalog";
import { reviewService } from "@/features/review";
import { shopService } from "@/features/shop";
import { ShopTabs } from "./ShopTabs";

// The API only exposes reviews per product (`GET /products/:id/reviews`), not per
// shop — there's no shop-level reviews endpoint. Aggregate across the shop's
// products, capped to keep the number of parallel requests bounded for shops with
// many listings.
const REVIEW_AGGREGATION_PRODUCT_LIMIT = 20;

interface ShopPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const shop = await shopService.getShopBySlug(slug);
    return { title: `${shop.name} | ShopHub` };
  } catch {
    return { title: "Gian hàng | ShopHub" };
  }
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { slug } = await params;

  let shop;
  try {
    shop = await shopService.getShopBySlug(slug);
  } catch {
    notFound();
  }

  const products = await catalogService.getProducts({ shopId: shop.id, limit: 100 });

  const reviewResults = await Promise.all(
    products.items
      .slice(0, REVIEW_AGGREGATION_PRODUCT_LIMIT)
      .map((product) => reviewService.getProductReviews(product.id, 1, 50)),
  );
  const shopReviews = reviewResults.flatMap((result) => result.items);
  const shopReviewTotal = reviewResults.reduce((sum, result) => sum + result.total, 0);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 pb-10">
      <div className="h-32 bg-gradient-to-br from-hub-600 to-hub-900 md:h-48" />

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 md:px-6">
        <div className="-mt-12 flex items-end gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-hub-500 text-2xl font-bold text-white font-sora shadow-sm">
            {shop.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-1 items-center justify-between pb-1">
            <div>
              <h1 className="text-lg font-bold font-sora text-neutral-900">{shop.name}</h1>
              <p className="text-xs text-neutral-500 font-manrope">
                ⭐ {Number(shop.ratingAvg).toFixed(1)} · Đã bán {shop.totalSold}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                title="Tính năng đang phát triển"
                className="rounded-lg border border-hub-500 px-3 py-1.5 text-xs font-bold font-manrope text-hub-600 opacity-60"
                disabled
              >
                + Theo dõi
              </button>
              <button
                type="button"
                title="Tính năng đang phát triển"
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold font-manrope text-neutral-500 opacity-60"
                disabled
              >
                💬 Chat
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-neutral-100 p-3 text-center">
            <p className="text-lg font-bold font-sora text-hub-600">{products.total}</p>
            <p className="text-xs text-neutral-500 font-manrope">Sản phẩm</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-3 text-center">
            <p className="text-lg font-bold font-sora text-hub-600">{shop.totalSold}</p>
            <p className="text-xs text-neutral-500 font-manrope">Đã bán</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-3 text-center">
            <p className="text-lg font-bold font-sora text-hub-600">
              {Number(shop.ratingAvg).toFixed(1)}
            </p>
            <p className="text-xs text-neutral-500 font-manrope">Đánh giá</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 p-3 text-center">
            <p className="text-lg font-bold font-sora text-hub-600">
              {shop.status === "approved" ? "✓" : "—"}
            </p>
            <p className="text-xs text-neutral-500 font-manrope">Đã xác thực</p>
          </div>
        </div>

        <ShopTabs
          products={products.items}
          reviews={shopReviews}
          reviewTotal={shopReviewTotal}
          aboutText={`${shop.name} là gian hàng trên ShopHub, đã bán ${shop.totalSold} sản phẩm với đánh giá trung bình ${Number(shop.ratingAvg).toFixed(1)}/5.`}
        />
      </div>
    </div>
  );
}
