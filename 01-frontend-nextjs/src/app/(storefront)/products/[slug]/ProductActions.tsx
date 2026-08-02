"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAddCartItem } from "@/features/cart";
import type { ProductVariant } from "@/features/catalog";
import { Button } from "@/shared/components/Button";
import { notify } from "@/shared/services/notify";
import { useSessionStore } from "@/shared/stores/session.store";
import { formatPrice } from "@/shared/utils/format-price";
import { formatAttributeLabel } from "@/shared/utils/variant-attribute-label";

interface ProductActionsProps {
  variants: ProductVariant[];
}

export function ProductActions({ variants }: ProductActionsProps) {
  const router = useRouter();
  const accessToken = useSessionStore((state) => state.accessToken);
  const addCartItem = useAddCartItem();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? variants[0],
    [variants, selectedVariantId],
  );

  if (!selectedVariant) return null;

  const attributeKeys = Object.keys(selectedVariant.attributes);
  const outOfStock = selectedVariant.stockQuantity <= 0;

  const selectAttribute = (key: string, value: string) => {
    const nextAttributes = { ...selectedVariant.attributes, [key]: value };
    const exactMatch = variants.find((variant) =>
      Object.entries(nextAttributes).every(([k, v]) => variant.attributes[k] === v),
    );
    const fallback = variants.find((variant) => variant.attributes[key] === value);
    const match = exactMatch ?? fallback;
    if (match) {
      setSelectedVariantId(match.id);
      setQuantity(1);
    }
  };

  const ensureAuthed = () => {
    if (!accessToken) {
      notify.info("Vui lòng đăng nhập để tiếp tục mua sắm");
      router.push("/login");
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!ensureAuthed()) return;
    addCartItem.mutate({ variantId: selectedVariant.id, quantity });
  };

  const handleBuyNow = () => {
    if (!ensureAuthed()) return;
    addCartItem.mutate(
      { variantId: selectedVariant.id, quantity },
      { onSuccess: () => router.push("/cart") },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold font-sora text-hub-600">
          {formatPrice(selectedVariant.price)}
        </span>
        {selectedVariant.compareAtPrice && (
          <span className="text-sm text-neutral-400 line-through">
            {formatPrice(selectedVariant.compareAtPrice)}
          </span>
        )}
      </div>

      {attributeKeys.map((key) => {
        const options = [...new Set(variants.map((variant) => variant.attributes[key]))];
        return (
          <div key={key}>
            <p className="mb-1.5 text-xs font-bold font-manrope text-neutral-700">
              {formatAttributeLabel(key)}
            </p>
            <div className="flex flex-wrap gap-2">
              {options.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectAttribute(key, value)}
                  className={[
                    "rounded-lg border px-3 py-1.5 text-xs font-manrope",
                    selectedVariant.attributes[key] === value
                      ? "border-hub-500 bg-hub-50 text-hub-600"
                      : "border-neutral-200 text-neutral-600",
                  ].join(" ")}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <div>
        <p className="mb-1.5 text-xs font-bold font-manrope text-neutral-700">Số lượng</p>
        <div className="flex w-fit items-center rounded-lg border border-neutral-200">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-9 w-9 text-neutral-600"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-manrope">{quantity}</span>
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.min(selectedVariant.stockQuantity, q + 1))
            }
            className="h-9 w-9 text-neutral-600"
          >
            +
          </button>
        </div>
        <p className="mt-1 text-xs text-neutral-400 font-manrope">
          {outOfStock ? "Hết hàng" : `Còn ${selectedVariant.stockQuantity} sản phẩm`}
        </p>
      </div>

      <div className="sticky bottom-16 z-30 -mx-4 flex gap-3 border-t border-neutral-100 bg-white px-4 py-3 md:static md:mx-0 md:border-0 md:p-0">
        <Button
          type="button"
          variant="outline"
          disabled={outOfStock || addCartItem.isPending}
          onClick={handleAddToCart}
        >
          Thêm vào giỏ
        </Button>
        <Button
          type="button"
          disabled={outOfStock || addCartItem.isPending}
          onClick={handleBuyNow}
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
