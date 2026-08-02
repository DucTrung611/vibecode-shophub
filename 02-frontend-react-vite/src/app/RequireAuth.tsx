import { Navigate, Outlet } from "react-router";
import { useSessionStore } from "../shared/stores/session.store";

interface RequireAuthProps {
  role?: "seller" | "admin";
}

export function RequireAuth({ role }: RequireAuthProps) {
  const accessToken = useSessionStore((state) => state.accessToken);
  const user = useSessionStore((state) => state.user);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
