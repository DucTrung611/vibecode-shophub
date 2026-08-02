import type { ProductListItem } from "../types/catalog.types";
import { ProductCard } from "./ProductCard";
import { ProductListRow } from "./ProductListRow";

interface ProductGridProps {
  products: ProductListItem[];
  view?: "grid" | "list";
}

export function ProductGrid({ products, view = "grid" }: ProductGridProps) {
  if (view === "list") {
    return (
      <div className="flex flex-col gap-3">
        {products.map((product) => (
          <ProductListRow key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
