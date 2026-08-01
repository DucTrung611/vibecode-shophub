import { useQuery } from "@tanstack/react-query";
import * as userService from "../services/user.service";

export const ADDRESSES_QUERY_KEY = ["user", "addresses"] as const;

export function useAddresses() {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: userService.getAddresses,
  });
}
