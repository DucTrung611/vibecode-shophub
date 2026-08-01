import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSessionStore } from "../../../shared/stores/session.store";
import * as authService from "../services/auth.service";
import type { RegisterFormValues } from "../utils/auth.schema";

export function useRegister() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    // agreeTerms is client-only (backend DTO rejects unknown fields) — strip before sending.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: ({ agreeTerms, ...values }: RegisterFormValues) =>
      authService.register(values),
    onSuccess: (data) => {
      setSession(data);
      router.push("/");
    },
  });
}
