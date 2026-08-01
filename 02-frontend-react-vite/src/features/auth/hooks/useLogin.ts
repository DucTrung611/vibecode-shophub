import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useSessionStore } from "../../../shared/stores/session.store";
import * as authService from "../services/auth.service";
import type { LoginFormValues } from "../utils/auth.schema";
import { WrongRoleError } from "../utils/wrong-role.error";

const DASHBOARD_ROLES = new Set(["seller", "admin"]);

export function useLogin() {
  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const data = await authService.login(values);
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
