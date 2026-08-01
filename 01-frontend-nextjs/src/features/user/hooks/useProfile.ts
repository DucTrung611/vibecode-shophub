import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "../../../shared/stores/session.store";
import * as userService from "../services/user.service";

export const PROFILE_QUERY_KEY = ["user", "profile"] as const;

export function useProfile() {
  const accessToken = useSessionStore((state) => state.accessToken);
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: userService.getProfile,
    enabled: Boolean(accessToken),
  });
}
