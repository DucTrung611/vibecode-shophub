import { useNavigate, NavLink, Outlet } from "react-router";
import {
  Bell,
  BarChart3,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Package,
  PackageSearch,
  Receipt,
  Settings,
  Store,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";
import * as authService from "../../features/auth/services/auth.service";
import { useSessionStore } from "../stores/session.store";

export type DashboardRole = "seller" | "admin";

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

const SELLER_NAV: NavItem[] = [
  { to: "/seller", label: "Dashboard", icon: LayoutDashboard },
  { to: "/seller/products", label: "Sản phẩm", icon: Package },
  { to: "/seller/orders", label: "Đơn hàng", icon: Receipt },
  { to: "/seller/inventory", label: "Kho hàng", icon: ClipboardList },
  { to: "/seller/settings", label: "Cài đặt shop", icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/admin/users", label: "Người dùng", icon: Users },
  { to: "/admin/shops", label: "Duyệt gian hàng", icon: Store },
  { to: "/admin/products", label: "Kiểm duyệt sản phẩm", icon: PackageSearch },
  { to: "/admin/categories", label: "Danh mục", icon: FolderTree },
  { to: "/admin/reports", label: "Báo cáo & phân tích", icon: BarChart3 },
];

const TITLES: Record<DashboardRole, string> = {
  seller: "Seller Center",
  admin: "Admin Panel",
};

interface DashboardShellProps {
  role: DashboardRole;
  title?: string;
}

export function DashboardShell({ role, title }: DashboardShellProps) {
  const navigate = useNavigate();
  const user = useSessionStore((state) => state.user);
  const clearSession = useSessionStore((state) => state.clearSession);

  const navItems = role === "seller" ? SELLER_NAV : ADMIN_NAV;
  const sidebarBg = role === "seller" ? "bg-seller-ink" : "bg-admin-ink";

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className={`flex w-[236px] shrink-0 flex-col gap-1 p-4 ${sidebarBg}`}>
        <div className="mb-6 flex items-center gap-2 px-1.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gradient-to-br from-hub-400 to-hub-500 font-sora text-[15px] font-extrabold text-white">
            S
          </div>
          <div className="font-sora text-base font-extrabold text-white">
            ShopHub{" "}
            <span className="text-[11px] font-semibold text-hub-300">
              {role === "seller" ? "Seller" : "Admin"}
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/seller" || item.to === "/admin"}
              className={({ isActive }) =>
                [
                  "flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-[13px] font-bold font-manrope transition-colors",
                  isActive
                    ? "bg-hub-500 text-white"
                    : "text-neutral-300 hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2.5 rounded-[10px] bg-white/[0.06] p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-hub-500 font-sora text-[13px] font-bold text-white">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-white">
              {user?.fullName ?? "—"}
            </div>
            <div className="text-[10px] text-hub-300">{TITLES[role]}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            aria-label="Đăng xuất"
            className="rounded-lg p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-7">
          <h1 className="font-sora text-lg font-extrabold text-neutral-900">
            {title ?? TITLES[role]}
          </h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Thông báo"
              className="relative text-neutral-700 hover:text-hub-600"
            >
              <Bell size={18} />
            </button>
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-hub-500 font-sora text-[13px] font-bold text-white">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
