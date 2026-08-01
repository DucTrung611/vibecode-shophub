"use client";

import { useState } from "react";
import { ProductGrid } from "@/features/catalog";
import type { ProductListItem } from "@/features/catalog";

interface ShopTabsProps {
  products: ProductListItem[];
  aboutText: string;
}

export function ShopTabs({ products, aboutText }: ShopTabsProps) {
  const [tab, setTab] = useState<"products" | "about">("products");

  return (
    <div>
      <div className="mb-4 flex gap-2 border-b border-neutral-100">
        {(
          [
            { key: "products", label: `Sản phẩm (${products.length})` },
            { key: "about", label: "Giới thiệu" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={[
              "border-b-2 px-3 py-2 text-sm font-manrope",
              tab === item.key
                ? "border-hub-500 font-bold text-hub-600"
                : "border-transparent text-neutral-500",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "products" ? (
        products.length === 0 ? (
          <p className="py-10 text-center text-sm font-manrope text-neutral-500">
            Shop chưa có sản phẩm nào
          </p>
        ) : (
          <ProductGrid products={products} />
        )
      ) : (
        <p className="text-sm font-manrope text-neutral-600">{aboutText}</p>
      )}
    </div>
  );
}
