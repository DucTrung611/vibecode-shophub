import { Navigate, Outlet } from "react-router";
import { useSessionStore } from "../shared/stores/session.store";

export function RequireAuth() {
  const accessToken = useSessionStore((state) => state.accessToken);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
