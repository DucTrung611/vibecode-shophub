import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../../shared/services/notify";
import { updateMyShop } from "../services/shop.service";
import { shopKeys } from "./useMyShop";

export function useUpdateShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyShop,
    onSuccess: (data) => {
      queryClient.setQueryData(shopKeys.me, data);
      notify.success("Đã cập nhật thông tin shop");
    },
    onError: () => {
      notify.error("Cập nhật thất bại, vui lòng thử lại");
    },
  });
}
