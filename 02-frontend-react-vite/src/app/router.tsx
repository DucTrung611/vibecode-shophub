import { createBrowserRouter, Navigate } from "react-router";
import { DashboardPlaceholder } from "./DashboardPlaceholder";
import { LoginPage } from "./LoginPage";
import { RequireAuth } from "./RequireAuth";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: "/seller", element: <DashboardPlaceholder role="seller" /> },
      { path: "/admin", element: <DashboardPlaceholder role="admin" /> },
      { path: "/", element: <Navigate to="/login" replace /> },
    ],
  },
]);
