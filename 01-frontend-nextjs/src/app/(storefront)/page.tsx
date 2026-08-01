import { CategoryGrid, ProductGrid, catalogService } from "@/features/catalog";

export default async function HomePage() {
  const [categories, recommended, newArrivals] = await Promise.all([
    catalogService.getCategories(),
    catalogService.getProducts({ limit: 12, sortBy: "soldCount", order: "desc" }),
    catalogService.getProducts({ limit: 6, sortBy: "createdAt", order: "desc" }),
  ]);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-6 md:px-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-hub-600 to-hub-900 px-6 py-10 text-white md:px-12 md:py-16">
        <p className="text-xs font-manrope uppercase tracking-wide text-hub-100">
          ShopHub
        </p>
        <h1 className="mt-2 max-w-md text-2xl font-bold font-sora md:text-4xl">
          Mua sắm thả ga, giá tốt mỗi ngày
        </h1>
        <p className="mt-3 max-w-sm text-sm text-hub-100 font-manrope">
          Hàng ngàn sản phẩm từ các gian hàng uy tín trên toàn quốc
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold font-sora text-neutral-900">
          Danh mục nổi bật
        </h2>
        <CategoryGrid categories={categories} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold font-sora text-neutral-900">
          Hàng mới về
        </h2>
        <ProductGrid products={newArrivals.items} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold font-sora text-neutral-900">
          Gợi ý cho bạn
        </h2>
        <ProductGrid products={recommended.items} />
      </section>
    </div>
  );
}
