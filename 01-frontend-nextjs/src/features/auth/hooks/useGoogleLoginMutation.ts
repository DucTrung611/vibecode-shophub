import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSessionStore } from "../../../shared/stores/session.store";
import * as authService from "../services/auth.service";

export function useGoogleLoginMutation() {
  const router = useRouter();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: (idToken: string) => authService.loginWithGoogle(idToken),
    onSuccess: (data) => {
      setSession(data);
      router.push("/");
    },
  });
}
