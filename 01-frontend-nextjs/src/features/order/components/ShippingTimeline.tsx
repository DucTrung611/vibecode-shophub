import type { OrderStatus } from "../types/order.types";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Đặt hàng thành công" },
  { status: "confirmed", label: "Đã xác nhận" },
  { status: "shipped", label: "Đang giao hàng" },
  { status: "delivered", label: "Đã giao hàng" },
];

const STEP_ORDER: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

export function ShippingTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="text-sm font-manrope text-error">Đơn hàng đã bị hủy</p>;
  }

  const currentIndex = STEP_ORDER.indexOf(status);

  return (
    <div className="flex flex-col gap-4">
      {STEPS.map((step, index) => {
        const isDone = index <= currentIndex;
        return (
          <div key={step.status} className="flex items-center gap-3">
            <span
              className={[
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs",
                isDone ? "bg-hub-500 text-white" : "bg-neutral-100 text-neutral-400",
              ].join(" ")}
            >
              {isDone ? "✓" : ""}
            </span>
            <span
              className={[
                "text-sm font-manrope",
                isDone ? "text-neutral-900" : "text-neutral-400",
              ].join(" ")}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
