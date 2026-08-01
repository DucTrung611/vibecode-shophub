import { apiClient } from "../../../shared/services/api-client";
import type { ApiResult } from "../../../shared/types/api-response.types";
import type { AuthResponse } from "../types/auth.types";
import type { LoginFormValues, RegisterFormValues } from "../utils/auth.schema";

export async function login(values: LoginFormValues): Promise<AuthResponse> {
  const result = (await apiClient.post(
    "/auth/login",
    values,
  )) as unknown as ApiResult<AuthResponse>;
  return result.data;
}

export async function register(
  values: Omit<RegisterFormValues, "agreeTerms">,
): Promise<AuthResponse> {
  const result = (await apiClient.post(
    "/auth/register",
    values,
  )) as unknown as ApiResult<AuthResponse>;
  return result.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
