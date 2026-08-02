import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useSessionStore } from "../stores/session.store";
import { ApiError, type ApiErrorResponse, type ApiSuccess } from "../types/api-response.types";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:6060/api/v1";

export const apiClient = axios.create({ baseURL });

// `rawApiClient` shares the same base URL/auth/refresh behavior as `apiClient` but
// resolves with the FULL envelope ({ success, data, meta }) instead of unwrapping
// straight to `data`. `apiClient`'s interceptor below discards `meta`, so paginated
// list endpoints (which need `meta.total` for shared/components/Pagination.tsx)
// go through this instance instead.
export const rawApiClient = axios.create({ baseURL });

function attachAuthHeader(config: InternalAxiosRequestConfig) {
  const accessToken = useSessionStore.getState().accessToken;
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
}

apiClient.interceptors.request.use(attachAuthHeader);
rawApiClient.interceptors.request.use(attachAuthHeader);

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

function makeErrorHandler(client: typeof apiClient) {
  return async (error: AxiosError<ApiErrorResponse>) => {
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
        return client(originalRequest);
      } catch {
        useSessionStore.getState().clearSession();
        throw error;
      }
    }

    if (error.response?.data && "error" in error.response.data) {
      throw new ApiError(error.response.data.error);
    }
    throw error;
  };
}

apiClient.interceptors.response.use(
  (response) => response.data.data,
  makeErrorHandler(apiClient),
);

rawApiClient.interceptors.response.use(
  (response) => response.data,
  makeErrorHandler(rawApiClient),
);
