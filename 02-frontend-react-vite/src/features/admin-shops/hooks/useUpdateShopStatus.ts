import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../../shared/services/notify";
import { ApiError } from "../../../shared/types/api-response.types";
import * as adminShopsService from "../services/admin-shops.service";
import type { UpdateShopStatusPayload } from "../types/admin-shops.types";

export function useUpdateShopStatus(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateShopStatusPayload) =>
      adminShopsService.updateShopStatus(id, payload),
    onSuccess: () => {
      notify.success("Đã cập nhật trạng thái gian hàng");
      void queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "SHOP_003") {
        notify.error("Vui lòng nhập lý do từ chối");
        return;
      }
      notify.error("Không thể cập nhật trạng thái gian hàng. Vui lòng thử lại.");
    },
  });
}
