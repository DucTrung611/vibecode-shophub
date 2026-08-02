import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notify } from "../../../shared/services/notify";
import * as adminUsersService from "../services/admin-users.service";

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminUsersService.updateUserStatus(id, isActive),
    onSuccess: (user) => {
      notify.success(
        user.isActive ? `Đã mở khóa tài khoản ${user.fullName}` : `Đã khóa tài khoản ${user.fullName}`,
      );
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => {
      notify.error("Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.");
    },
  });
}
