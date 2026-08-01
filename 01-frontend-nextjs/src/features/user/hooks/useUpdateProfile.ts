import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as userService from "../services/user.service";
import { PROFILE_QUERY_KEY } from "./useProfile";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, profile);
    },
  });
}
