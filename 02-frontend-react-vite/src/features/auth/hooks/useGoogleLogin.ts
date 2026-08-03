import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useSessionStore } from "../../../shared/stores/session.store";
import * as authService from "../services/auth.service";
import { DASHBOARD_ROLES } from "../utils/dashboard-roles";
import { WrongRoleError } from "../utils/wrong-role.error";

export function useGoogleLogin() {
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (idToken: string) => {
      const data = await authService.loginWithGoogle(idToken);
      if (!DASHBOARD_ROLES.has(data.user.role)) {
        throw new WrongRoleError();
      }
      return data;
    },
    onSuccess: (data) => {
      setSession(data);
      navigate(`/${data.user.role}`);
    },
  });
}
