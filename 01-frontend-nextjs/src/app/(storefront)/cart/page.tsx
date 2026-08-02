"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartItemRow,
  CartSummaryBar,
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
  type CartItem,
} from "@/features/cart";
import { useValidateVoucher } from "@/features/voucher";
import { RequireAuth } from "@/shared/components/RequireAuth";
import { formatPrice } from "@/shared/utils/format-price";

interface AppliedVoucher {
  code: string;
  voucherId: number;
  discountAmount: number;
}

function CartPageContent() {
  const router = useRouter();
  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const validateVoucher = useValidateVoucher();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);

  const items = useMemo(() => cart?.items ?? [], [cart]);

  const seenItemIdsRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    const newIds = items.filter((item) => !seenItemIdsRef.current.has(item.id)).map((item) => item.id);
    if (newIds.length > 0) {
      for (const id of newIds) seenItemIdsRef.current.add(id);
      setSelectedIds((prev) => [...prev, ...newIds]);
    }
  }, [items]);

  const groupedByShop = useMemo(() => {
    const map = new Map<number, { shopName: string; items: CartItem[] }>();
    for (const item of items) {
      const shopId = item.variant.product.shopId;
      const group = map.get(shopId) ?? { shopName: item.variant.product.shop.name, items: [] };
      group.items.push(item);
      map.set(shopId, group);
    }
    return map;
  }, [items]);

  const hasIssue = items.some((item) => item.quantity > item.variant.stockQuantity);

  const toggleSelect = (itemId: number) => {
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0,
  );
  const discount = appliedVoucher?.discountAmount ?? 0;

  const handleApplyVoucher = () => {
    if (!voucherCode) return;
    validateVoucher.mutate(
      { code: voucherCode, cartTotal: subtotal },
      { onSuccess: (result) => setAppliedVoucher({ code: voucherCode, ...result }) },
    );
  };

  const handleCheckout = () => {
    const params = new URLSearchParams();
    params.set("items", selectedIds.join(","));
    if (appliedVoucher) params.set("voucherCode", appliedVoucher.code);
    router.push(`/checkout?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-16 text-center text-sm font-manrope text-neutral-500">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
        <span className="text-4xl">⚠️</span>
        <p className="font-manrope text-neutral-500">Không thể tải giỏ hàng của bạn</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg bg-hub-500 px-5 py-2 text-sm font-bold font-manrope text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
        <span className="text-4xl">🛒</span>
        <p className="font-manrope text-neutral-500">Giỏ hàng của bạn đang trống</p>
        <Link href="/products" className="text-sm font-bold text-hub-600">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-6 md:px-6">
      <h1 className="text-xl font-bold font-sora text-neutral-900">Giỏ hàng</h1>

      {hasIssue && (
        <div className="rounded-xl bg-error-tint px-4 py-3 text-sm font-manrope text-error">
          Một số sản phẩm không đủ số lượng trong kho, vui lòng kiểm tra lại.
        </div>
      )}

      {Array.from(groupedByShop.entries()).map(([shopId, group]) => (
        <div key={shopId} className="rounded-2xl border border-neutral-100 px-4">
          <p className="border-b border-neutral-100 py-3 text-sm font-bold font-manrope text-neutral-700">
            🏪 {group.shopName}
          </p>
          {group.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              selected={selectedIds.includes(item.id)}
              onToggleSelect={toggleSelect}
              onQuantityChange={(itemId, quantity) => updateItem.mutate({ itemId, quantity })}
              onRemove={(itemId) => {
                removeItem.mutate(itemId);
                setSelectedIds((prev) => prev.filter((id) => id !== itemId));
              }}
            />
          ))}
        </div>
      ))}

      <div className="flex gap-2">
        <input
          name="voucherCode"
          value={voucherCode}
          onChange={(event) => setVoucherCode(event.target.value)}
          placeholder="Nhập mã giảm giá"
          className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-manrope outline-none focus:border-hub-500"
        />
        <button
          type="button"
          onClick={handleApplyVoucher}
          disabled={validateVoucher.isPending || !voucherCode}
          className="rounded-lg border border-hub-500 px-4 text-sm font-bold font-manrope text-hub-600 disabled:opacity-50"
        >
          Áp dụng
        </button>
      </div>
      {validateVoucher.isError && (
        <p className="text-xs font-manrope text-error">Mã giảm giá không hợp lệ</p>
      )}
      {appliedVoucher && (
        <p className="text-xs font-manrope text-success">
          Đã áp dụng {appliedVoucher.code}: -{formatPrice(appliedVoucher.discountAmount)}
        </p>
      )}

      <CartSummaryBar
        total={Math.max(subtotal - discount, 0)}
        selectedCount={selectedItems.length}
        disabled={
          selectedItems.length === 0 ||
          selectedItems.some((item) => item.quantity > item.variant.stockQuantity)
        }
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default function CartPage() {
  return (
    <RequireAuth>
      <CartPageContent />
    </RequireAuth>
  );
}
