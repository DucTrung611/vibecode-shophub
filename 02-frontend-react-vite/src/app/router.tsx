import { createBrowserRouter, Navigate } from "react-router";
import { DashboardShell } from "../shared/components/DashboardShell";
import { AdminDashboardPage } from "../features/admin-dashboard";
import { AdminUsersPage } from "../features/admin-users";
import { AdminShopDetailPage, AdminShopsPage } from "../features/admin-shops";
import { AdminProductsPage } from "../features/admin-products";
import { AdminCategoriesPage } from "../features/admin-categories";
import { AdminReportsPage } from "../features/admin-reports";
import { SellerDashboardPage } from "../features/seller-dashboard";
import { ProductFormPage, SellerProductsPage } from "../features/seller-products";
import { SellerOrderDetailPage, SellerOrdersPage } from "../features/seller-orders";
import { SellerInventoryPage } from "../features/seller-inventory";
import { SellerSettingsPage } from "../features/seller-settings";
import { LoginPage } from "./LoginPage";
import { RequireAuth } from "./RequireAuth";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth role="seller" />,
    children: [
      {
        path: "/seller",
        element: <DashboardShell role="seller" />,
        children: [
          { index: true, element: <SellerDashboardPage /> },
          { path: "products", element: <SellerProductsPage /> },
          { path: "products/new", element: <ProductFormPage /> },
          { path: "products/:slug/edit", element: <ProductFormPage /> },
          { path: "orders", element: <SellerOrdersPage /> },
          { path: "orders/:id", element: <SellerOrderDetailPage /> },
          { path: "inventory", element: <SellerInventoryPage /> },
          { path: "settings", element: <SellerSettingsPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth role="admin" />,
    children: [
      {
        path: "/admin",
        element: <DashboardShell role="admin" />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "shops", element: <AdminShopsPage /> },
          { path: "shops/:id", element: <AdminShopDetailPage /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "categories", element: <AdminCategoriesPage /> },
          { path: "reports", element: <AdminReportsPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [{ path: "/", element: <Navigate to="/login" replace /> }],
  },
]);
