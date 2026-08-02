import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { DashboardShell } from "../components/DashboardShell";

vi.mock("../../features/auth/services/auth.service", () => ({
  logout: vi.fn(),
}));

function renderShell(role: "seller" | "admin") {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <DashboardShell role={role} />,
        children: [{ index: true, element: <div>Nội dung trang</div> }],
      },
    ],
    { initialEntries: ["/"] },
  );
  return render(<RouterProvider router={router} />);
}

describe("DashboardShell", () => {
  it("renders seller nav items and seller sidebar tone", () => {
    renderShell("seller");

    expect(screen.getByText("Sản phẩm")).toBeInTheDocument();
    expect(screen.getByText("Đơn hàng")).toBeInTheDocument();
    expect(screen.getByText("Kho hàng")).toBeInTheDocument();
    expect(screen.getByText("Cài đặt shop")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Seller Center" })).toBeInTheDocument();
  });

  it("renders admin nav items and admin sidebar tone", () => {
    renderShell("admin");

    expect(screen.getByText("Người dùng")).toBeInTheDocument();
    expect(screen.getByText("Duyệt gian hàng")).toBeInTheDocument();
    expect(screen.getByText("Kiểm duyệt sản phẩm")).toBeInTheDocument();
    expect(screen.getByText("Danh mục")).toBeInTheDocument();
    expect(screen.getByText("Báo cáo & phân tích")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Admin Panel" })).toBeInTheDocument();
  });

  it("renders the nested route content via Outlet", () => {
    renderShell("seller");

    expect(screen.getByText("Nội dung trang")).toBeInTheDocument();
  });
});
