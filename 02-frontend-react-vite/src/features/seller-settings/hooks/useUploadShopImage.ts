import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../../shared/services/notify";
import { uploadShopBanner, uploadShopLogo } from "../services/shop.service";
import { shopKeys } from "./useMyShop";

export function useUploadShopLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadShopLogo,
    onSuccess: (data) => {
      queryClient.setQueryData(shopKeys.me, data);
      notify.success("Đã cập nhật logo shop");
    },
    onError: () => {
      notify.error("Tải logo thất bại, vui lòng thử lại");
    },
  });
}

export function useUploadShopBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadShopBanner,
    onSuccess: (data) => {
      queryClient.setQueryData(shopKeys.me, data);
      notify.success("Đã cập nhật ảnh bìa shop");
    },
    onError: () => {
      notify.error("Tải ảnh bìa thất bại, vui lòng thử lại");
    },
  });
}
