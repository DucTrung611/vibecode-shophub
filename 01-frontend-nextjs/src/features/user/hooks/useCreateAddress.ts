import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as userService from "../services/user.service";
import { ADDRESSES_QUERY_KEY } from "./useAddresses";

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userService.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
    },
  });
}
