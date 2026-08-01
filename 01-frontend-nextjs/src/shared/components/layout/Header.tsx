"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useCart } from "../../../features/cart";
import { useSessionStore } from "../../stores/session.store";

export function Header() {
  const router = useRouter();
  const cartItemCount = useSessionStore((state) => state.cartItemCount);
  const user = useSessionStore((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  // Header is always mounted, so this is what keeps session.store's
  // cartItemCount (read by both this badge and BottomTabBar) in sync.
  useCart();

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(searchTerm ? `/search?q=${encodeURIComponent(searchTerm)}` : "/search");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
      <div className="hidden border-b border-neutral-100 bg-neutral-50 md:block">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-1.5 text-xs font-manrope text-neutral-500">
          <span>Giao hàng toàn quốc</span>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/profile" className="hover:text-hub-600">
                Xin chào, {user.fullName}
              </Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-hub-600">
                  Đăng nhập
                </Link>
                <Link href="/register" className="hover:text-hub-600">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hub-500 text-base font-bold text-white font-sora">
            S
          </div>
          <span className="hidden text-lg font-bold font-sora text-neutral-900 sm:inline">
            ShopHub
          </span>
        </Link>

        <form onSubmit={onSearchSubmit} className="flex-1">
          <input
            name="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            type="search"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-manrope outline-none focus:border-hub-500 focus:ring-3 focus:ring-hub-100"
          />
        </form>

        <Link
          href="/notifications"
          aria-label="Thông báo"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-50 md:flex"
        >
          🔔
        </Link>

        <Link
          href="/cart"
          aria-label="Giỏ hàng"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-50"
        >
          🛒
          {cartItemCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {cartItemCount}
            </span>
          )}
        </Link>
      </div>

      <nav className="hidden border-t border-neutral-100 md:block">
        <div className="mx-auto flex max-w-[1200px] gap-6 px-6 py-2.5 text-sm font-manrope text-neutral-600">
          <Link href="/products" className="hover:text-hub-600">
            Tất cả sản phẩm
          </Link>
          <Link href="/orders" className="hover:text-hub-600">
            Đơn hàng của tôi
          </Link>
          <Link href="/wishlist" className="hover:text-hub-600">
            Yêu thích
          </Link>
          <Link href="/profile" className="hover:text-hub-600">
            Tài khoản
          </Link>
        </div>
      </nav>
    </header>
  );
}
