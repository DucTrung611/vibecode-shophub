import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSessionStore } from "../../../shared/stores/session.store";
import * as authService from "../services/auth.service";
import type { LoginFormValues } from "../utils/auth.schema";

export function useLogin() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (values: LoginFormValues) => authService.login(values),
    onSuccess: (data) => {
      setSession(data);
      router.push("/");
    },
  });
}
