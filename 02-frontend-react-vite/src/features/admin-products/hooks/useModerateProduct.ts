import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../../shared/services/notify";
import * as adminProductsService from "../services/admin-products.service";
import type { ModerateProductPayload } from "../types/admin-products.types";

const ACTION_MESSAGE: Record<ModerateProductPayload["action"], string> = {
  approve: "Đã duyệt sản phẩm",
  request_changes: "Đã yêu cầu người bán chỉnh sửa",
  remove: "Đã gỡ sản phẩm",
};

export function useModerateProduct(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ModerateProductPayload) =>
      adminProductsService.moderateProduct(id, payload),
    onSuccess: (_data, variables) => {
      notify.success(ACTION_MESSAGE[variables.action]);
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: () => {
      notify.error("Không thể cập nhật trạng thái sản phẩm. Vui lòng thử lại.");
    },
  });
}
