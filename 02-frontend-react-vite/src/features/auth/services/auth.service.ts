import { apiClient } from "../../../shared/services/api-client";
import type { AuthResponse } from "../types/auth.types";
import type { LoginFormValues } from "../utils/auth.schema";

// apiClient's response interceptor unwraps { success, data, meta } down to `data`,
// so the declared generic here is the actual runtime resolved type despite the
// AxiosResponse<T> signature — see shared/services/api-client.ts.
export async function login(values: LoginFormValues): Promise<AuthResponse> {
  const response = await apiClient.post("/auth/login", values);
  return response as unknown as AuthResponse;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
