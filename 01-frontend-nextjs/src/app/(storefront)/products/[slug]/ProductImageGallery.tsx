"use client";

import { useState } from "react";
import { getAssetUrl } from "@/shared/utils/asset-url";
import type { ProductImage } from "@/features/catalog";

interface ProductImageGalleryProps {
  images: ProductImage[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const active = sorted[activeIndex];

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-hub-50 text-7xl">
        {active ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getAssetUrl(active.url)}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          "📦"
        )}
      </div>

      {sorted.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Xem ảnh ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={[
                "h-2 rounded-full transition-all",
                index === activeIndex ? "w-5 bg-hub-500" : "w-2 bg-neutral-300",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
