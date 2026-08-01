"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSessionStore } from "../../../shared/stores/session.store";
import * as authService from "../services/auth.service";

export function useLogout() {
  const router = useRouter();
  const clearSession = useSessionStore((state) => state.clearSession);

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearSession();
      router.push("/login");
    },
  });
}
