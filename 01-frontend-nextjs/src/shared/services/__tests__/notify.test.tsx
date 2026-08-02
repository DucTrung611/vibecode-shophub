import { render, screen } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { ToastContainer } from "@/shared/components/Toast";
import { notify, useToastStore } from "../notify";

describe("notify service", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it("success/error push a toast entry into the store with the right variant", () => {
    notify.success("Đã lưu thành công");
    notify.error("Thao tác thất bại");

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toMatchObject({ message: "Đã lưu thành công", variant: "success" });
    expect(toasts[1]).toMatchObject({ message: "Thao tác thất bại", variant: "error" });
  });

  it("ToastContainer renders pushed toasts and lets them be dismissed", () => {
    render(<ToastContainer />);

    act(() => {
      notify.error("Không thể tải dữ liệu");
    });

    expect(screen.getByText("Không thể tải dữ liệu")).toBeInTheDocument();

    act(() => {
      screen.getByLabelText("Đóng thông báo").click();
    });

    expect(screen.queryByText("Không thể tải dữ liệu")).not.toBeInTheDocument();
  });
});
