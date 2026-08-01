"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSessionStore } from "../../stores/session.store";

interface Tab {
  href: string;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { href: "/", label: "Trang chủ", icon: "🏠" },
  { href: "/products", label: "Danh mục", icon: "📦" },
  { href: "/cart", label: "Giỏ hàng", icon: "🛒" },
  { href: "/orders", label: "Đơn hàng", icon: "🧾" },
  { href: "/profile", label: "Tài khoản", icon: "👤" },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const cartItemCount = useSessionStore((state) => state.cartItemCount);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-neutral-100 bg-white md:hidden">
      {TABS.map((tab) => {
        const isActive = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={[
              "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-manrope",
              isActive ? "text-hub-600" : "text-neutral-500",
            ].join(" ")}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            {tab.href === "/cart" && cartItemCount > 0 && (
              <span className="absolute right-1/4 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
                {cartItemCount}
              </span>
            )}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
