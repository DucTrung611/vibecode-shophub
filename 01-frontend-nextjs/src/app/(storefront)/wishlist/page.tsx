"use client";

import Link from "next/link";
import { WishlistGrid, useWishlist } from "@/features/wishlist";
import { RequireAuth } from "@/shared/components/RequireAuth";

function WishlistPageContent() {
  const { data: items, isLoading, isError, refetch } = useWishlist();

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-6 md:px-6">
      <h1 className="text-xl font-bold font-sora text-neutral-900">Sản phẩm yêu thích</h1>

      {isLoading ? (
        <p className="py-10 text-center text-sm font-manrope text-neutral-500">Đang tải...</p>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="font-manrope text-neutral-500">
            Không thể tải sản phẩm yêu thích
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg bg-hub-500 px-5 py-2 text-sm font-bold font-manrope text-white"
          >
            Thử lại
          </button>
        </div>
      ) : !items || items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <span className="text-4xl">🤍</span>
          <p className="font-manrope text-neutral-500">Chưa có sản phẩm yêu thích nào</p>
          <Link href="/products" className="text-sm font-bold text-hub-600">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <WishlistGrid items={items} />
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <WishlistPageContent />
    </RequireAuth>
  );
}
