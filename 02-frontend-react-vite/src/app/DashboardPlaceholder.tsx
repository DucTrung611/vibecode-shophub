import { useNavigate } from "react-router";
import { Button } from "../shared/components/Button";
import * as authService from "../features/auth/services/auth.service";
import { useSessionStore } from "../shared/stores/session.store";

const TITLES: Record<string, string> = {
  seller: "Seller Center",
  admin: "Admin Panel",
};

export function DashboardPlaceholder({ role }: { role: "seller" | "admin" }) {
  const navigate = useNavigate();
  const user = useSessionStore((state) => state.user);
  const clearSession = useSessionStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50">
      <h1 className="text-2xl font-bold font-sora text-neutral-900">
        {TITLES[role]}
      </h1>
      <p className="text-sm text-neutral-500 font-manrope">
        Đăng nhập thành công với vai trò &quot;{user?.role}&quot; — trang{" "}
        {TITLES[role]} sẽ được xây dựng ở phần sau.
      </p>
      <Button
        variant="outline"
        className="w-auto"
        onClick={() => {
          void handleLogout();
        }}
      >
        Đăng xuất
      </Button>
    </div>
  );
}
