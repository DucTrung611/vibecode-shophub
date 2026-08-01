import { BottomTabBar } from "./BottomTabBar";
import { Header } from "./Header";

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <footer className="hidden border-t border-neutral-100 bg-neutral-50 py-8 md:block">
        <div className="mx-auto max-w-[1200px] px-6 text-center text-xs text-neutral-500 font-manrope">
          © {new Date().getFullYear()} ShopHub. Nền tảng thương mại đa gian hàng.
        </div>
      </footer>
      <BottomTabBar />
    </div>
  );
}
