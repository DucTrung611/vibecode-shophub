import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "../components/LoginForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("LoginForm", () => {
  it("renders the email and password fields with the login button", () => {
    renderWithQueryClient(<LoginForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeInTheDocument();
  });

  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(screen.getByText("Vui lòng nhập email")).toBeInTheDocument();
      expect(screen.getByText("Vui lòng nhập mật khẩu")).toBeInTheDocument();
    });
  });

  it("shows an email-format error for an invalid address", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(screen.getByText("Email không hợp lệ")).toBeInTheDocument();
    });
  });
});
