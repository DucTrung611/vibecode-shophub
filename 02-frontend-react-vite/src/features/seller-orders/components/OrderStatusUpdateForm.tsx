import { useState } from "react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { useUpdateOrderStatus } from "../hooks/useUpdateOrderStatus";
import type { OrderStatus } from "../types/order.types";
import { NEXT_STATUS_OPTIONS, orderStatusLabel } from "../utils/order-status.util";

interface OrderStatusUpdateFormProps {
  orderId: number;
  currentStatus: OrderStatus;
}

export function OrderStatusUpdateForm({ orderId, currentStatus }: OrderStatusUpdateFormProps) {
  const nextOptions = NEXT_STATUS_OPTIONS[currentStatus];
  const [selected, setSelected] = useState<OrderStatus | null>(nextOptions[0] ?? null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const updateStatus = useUpdateOrderStatus(orderId);

  if (nextOptions.length === 0) {
    return (
      <p className="text-sm font-manrope text-neutral-500">
        Đơn hàng ở trạng thái cuối cùng, không thể cập nhật thêm.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {nextOptions.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2.5 rounded-[9px] border border-neutral-200 px-3.5 py-2.5 text-sm font-manrope text-neutral-800 has-[:checked]:border-hub-500 has-[:checked]:bg-hub-50"
          >
            <input
              type="radio"
              name="next-status"
              value={option}
              checked={selected === option}
              onChange={() => setSelected(option)}
            />
            {orderStatusLabel(option)}
          </label>
        ))}
      </div>

      {selected === "shipped" && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Đơn vị vận chuyển"
            value={carrier}
            onChange={(event) => setCarrier(event.target.value)}
            placeholder="GHN"
          />
          <Input
            label="Mã vận đơn"
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="VN123456789"
          />
        </div>
      )}

      <div>
        <Button
          type="button"
          isLoading={updateStatus.isPending}
          disabled={!selected}
          onClick={() => {
            if (!selected) return;
            updateStatus.mutate({
              status: selected,
              trackingNumber: trackingNumber || undefined,
              carrier: carrier || undefined,
            });
          }}
        >
          Cập nhật trạng thái
        </Button>
      </div>
    </div>
  );
}
