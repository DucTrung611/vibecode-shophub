import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogService } from "@/features/catalog";
import { ReviewsSection, reviewService } from "@/features/review";
import { ShopMiniCard, shopService } from "@/features/shop";
import { WishlistButton } from "@/features/wishlist";
import { ProductActions } from "./ProductActions";
import { ProductImageGallery } from "./ProductImageGallery";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await catalogService.getProductBySlug(slug);
    return {
      title: `${product.name} | ShopHub`,
      description: product.name,
    };
  } catch {
    return { title: "Sản phẩm | ShopHub" };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await catalogService.getProductBySlug(slug);
  } catch {
    notFound();
  }

  const [shop, reviews] = await Promise.all([
    shopService.getShopBySlug(product.shop.slug),
    reviewService.getProductReviews(product.id),
  ]);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="relative md:w-1/2">
          <ProductImageGallery images={product.images} />
          <WishlistButton productId={product.id} className="absolute right-3 top-3" />
        </div>

        <div className="flex flex-col gap-4 md:w-1/2">
          <div>
            <h1 className="text-xl font-bold font-sora text-neutral-900">{product.name}</h1>
            <p className="mt-1 text-sm text-neutral-500 font-manrope">
              ⭐ {Number(product.ratingAvg).toFixed(1)} · Đã bán {product.soldCount}
            </p>
          </div>

          <ProductActions variants={product.variants} />

          <div className="rounded-2xl bg-neutral-50 p-4 text-sm font-manrope text-neutral-600">
            🚚 Giao hàng toàn quốc · Đổi trả trong 7 ngày
          </div>

          <ShopMiniCard shop={shop} />
        </div>
      </div>

      <ReviewsSection reviews={reviews.items} total={reviews.total} />
    </div>
  );
}
