import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../../shared/services/notify";
import { updateOrderStatus, type OrderStatusUpdatePayload } from "../services/order.service";
import { orderKeys } from "./useSellerOrders";

export function useUpdateOrderStatus(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrderStatusUpdatePayload) => updateOrderStatus(orderId, payload),
    onSuccess: () => {
      notify.success("Đã cập nhật trạng thái đơn hàng");
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: ["seller-orders", "list"] });
    },
    onError: () => {
      notify.error("Cập nhật trạng thái thất bại, vui lòng thử lại");
    },
  });
}
