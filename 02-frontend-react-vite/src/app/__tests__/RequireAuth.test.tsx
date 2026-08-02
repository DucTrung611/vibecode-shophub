import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { useSessionStore } from "../../shared/stores/session.store";
import { RequireAuth } from "../RequireAuth";

function renderWithRoute(role?: "seller" | "admin") {
  const router = createMemoryRouter(
    [
      { path: "/login", element: <div>Trang đăng nhập</div> },
      {
        element: <RequireAuth role={role} />,
        children: [{ path: "/protected", element: <div>Nội dung bảo vệ</div> }],
      },
    ],
    { initialEntries: ["/protected"] },
  );
  return render(<RouterProvider router={router} />);
}

describe("RequireAuth", () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null, accessToken: null, refreshToken: null });
  });

  it("redirects to /login when there is no access token", () => {
    renderWithRoute();

    expect(screen.getByText("Trang đăng nhập")).toBeInTheDocument();
  });

  it("renders the protected route when authenticated and no role is required", () => {
    useSessionStore.setState({
      user: { id: 1, fullName: "Nguyen Van A", role: "seller" },
      accessToken: "token",
      refreshToken: "refresh",
    });

    renderWithRoute();

    expect(screen.getByText("Nội dung bảo vệ")).toBeInTheDocument();
  });

  it("redirects to /login when the authenticated user's role does not match", () => {
    useSessionStore.setState({
      user: { id: 1, fullName: "Nguyen Van A", role: "buyer" },
      accessToken: "token",
      refreshToken: "refresh",
    });

    renderWithRoute("seller");

    expect(screen.getByText("Trang đăng nhập")).toBeInTheDocument();
  });

  it("renders the protected route when the authenticated user's role matches", () => {
    useSessionStore.setState({
      user: { id: 1, fullName: "Nguyen Van A", role: "admin" },
      accessToken: "token",
      refreshToken: "refresh",
    });

    renderWithRoute("admin");

    expect(screen.getByText("Nội dung bảo vệ")).toBeInTheDocument();
  });
});
