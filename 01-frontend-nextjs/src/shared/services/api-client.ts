import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "../stores/session.store";
import { ApiError, type ApiErrorResponse, type ApiSuccess } from "../types/api-response.types";
import { notify } from "./notify";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:6060/api/v1";

// Response interceptor below resolves every call to `ApiResult<T>` (`{data, meta}`),
// not an AxiosResponse — see the interceptor and shared/types/api-response.types.ts.
export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use((config) => {
  const accessToken = useSessionStore.getState().accessToken;
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useSessionStore.getState().refreshToken;
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post<
    ApiSuccess<{ accessToken: string; refreshToken: string }>
  >(`${baseURL}/auth/refresh`, { refreshToken });

  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  useSessionStore.setState({ accessToken, refreshToken: newRefreshToken });
  return accessToken;
}

apiClient.interceptors.response.use(
  // Every call site casts the resolved value to ApiResult<T> (see the module
  // comment above) — axios' interceptor typing expects an AxiosResponse back,
  // so this cast documents that the actual runtime shape intentionally diverges.
  (response) =>
    ({ data: response.data.data, meta: response.data.meta }) as unknown as typeof response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/");
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !isAuthEndpoint
    ) {
      originalRequest._retried = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
        return apiClient(originalRequest);
      } catch {
        useSessionStore.getState().clearSession();
        throw error;
      }
    }

    // Reached only for errors that are NOT being silently retried above (already
    // exhausted the 401-refresh path, or not a 401 at all) — surface a toast as a
    // safety net. Individual hooks/pages with bespoke error UX (e.g. Cart's
    // voucher-validate mutation) still render their own message; this doesn't
    // replace that, it just ensures nothing fails silently by default.
    if (error.response?.data && "error" in error.response.data) {
      notify.error(error.response.data.error.message);
      throw new ApiError(error.response.data.error);
    }
    notify.error("Đã xảy ra lỗi, vui lòng thử lại.");
    throw error;
  },
);
