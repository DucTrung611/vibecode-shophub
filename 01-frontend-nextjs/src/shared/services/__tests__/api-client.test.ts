import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A minimal fake `axios` that reproduces just enough of the real behavior for
 * `api-client.ts`'s interceptor logic to run against: `axios.create()` returns
 * a callable instance exposing `.get/.post/.patch/.delete/.interceptors`, and
 * every one of those funnels through a single `transport` mock standing in for
 * the actual HTTP layer — tests drive it with `mockResolvedValueOnce` /
 * `mockRejectedValueOnce` the same way `axios-mock-adapter` would, without
 * adding a new dependency (none is present in package.json).
 */
interface FakeHeaders {
  set: (key: string, value: string) => void;
  get: (key: string) => string | undefined;
}

interface FakeConfig {
  url?: string;
  method?: string;
  data?: unknown;
  headers?: FakeHeaders;
  [key: string]: unknown;
}

type FakeInstance = ((config: FakeConfig) => Promise<unknown>) & {
  get: (url: string, config?: FakeConfig) => Promise<unknown>;
  post: (url: string, data?: unknown, config?: FakeConfig) => Promise<unknown>;
  patch: (url: string, data?: unknown, config?: FakeConfig) => Promise<unknown>;
  delete: (url: string, config?: FakeConfig) => Promise<unknown>;
  interceptors: {
    request: { use: (fn: (config: FakeConfig) => unknown) => void };
    response: {
      use: (
        onFulfilled: (value: unknown) => unknown,
        onRejected: (error: unknown) => unknown,
      ) => void;
    };
  };
};

const transport = vi.fn();
const axiosPostMock = vi.fn();

function makeHeaders(): FakeHeaders {
  const store = new Map<string, string>();
  return {
    set: (key: string, value: string) => store.set(key, value),
    get: (key: string) => store.get(key),
  };
}

function createFakeAxiosInstance(): FakeInstance {
  const requestInterceptors: Array<(config: FakeConfig) => unknown> = [];
  const responseInterceptors: Array<{
    onFulfilled: (value: unknown) => unknown;
    onRejected: (error: unknown) => unknown;
  }> = [];

  async function runRequestChain(config: FakeConfig): Promise<FakeConfig> {
    let cfg = config;
    for (const fn of requestInterceptors) {
      cfg = ((await fn(cfg)) as FakeConfig | undefined) ?? cfg;
    }
    return cfg;
  }

  async function runResponseChain(promise: Promise<unknown>): Promise<unknown> {
    try {
      const response = await promise;
      let result = response;
      for (const handler of responseInterceptors) {
        result = await handler.onFulfilled(result);
      }
      return result;
    } catch (error) {
      let err = error;
      for (const handler of responseInterceptors) {
        try {
          return await handler.onRejected(err);
        } catch (nextError) {
          err = nextError;
        }
      }
      throw err;
    }
  }

  async function request(config: FakeConfig): Promise<unknown> {
    const cfg = await runRequestChain({ ...config, headers: config.headers ?? makeHeaders() });
    return runResponseChain(transport(cfg));
  }

  const instance = ((config: FakeConfig) => request(config)) as FakeInstance;
  instance.get = (url, config = {}) => request({ ...config, url, method: "get" });
  instance.post = (url, data, config = {}) => request({ ...config, url, method: "post", data });
  instance.patch = (url, data, config = {}) => request({ ...config, url, method: "patch", data });
  instance.delete = (url, config = {}) => request({ ...config, url, method: "delete" });
  instance.interceptors = {
    request: { use: (fn) => requestInterceptors.push(fn) },
    response: {
      use: (onFulfilled, onRejected) => responseInterceptors.push({ onFulfilled, onRejected }),
    },
  };
  return instance;
}

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => createFakeAxiosInstance()),
    post: (...args: unknown[]) => axiosPostMock(...args),
  },
}));

vi.mock("../notify", () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

function successEnvelope(data: unknown) {
  return { data: { success: true, data, meta: null } };
}

function errorResponse(status: number, code: string, message: string, url: string) {
  return {
    config: { url, headers: makeHeaders() },
    response: { status, data: { success: false, error: { code, message, details: null } } },
  };
}

describe("apiClient", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    transport.mockReset();
    axiosPostMock.mockReset();
    const { useSessionStore } = await import("../../stores/session.store");
    useSessionStore.setState({
      user: null,
      accessToken: "old-access-token",
      refreshToken: "old-refresh-token",
      cartItemCount: 0,
    });
  });

  it("refreshes the token once on a 401 from a non-auth endpoint and retries the original request", async () => {
    const { apiClient } = await import("../api-client");

    transport
      .mockRejectedValueOnce(errorResponse(401, "AUTH_002", "Token expired", "/cart"))
      .mockResolvedValueOnce(successEnvelope({ items: [] }));
    axiosPostMock.mockResolvedValueOnce({
      data: { data: { accessToken: "new-access-token", refreshToken: "new-refresh-token" } },
    });

    const result = (await apiClient.get("/cart")) as unknown as { data: { items: unknown[] } };

    expect(result.data.items).toEqual([]);
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock.mock.calls[0][0]).toContain("/auth/refresh");
    expect(transport).toHaveBeenCalledTimes(2);
    // The retried request carries the newly-refreshed access token.
    const retriedConfig = transport.mock.calls[1][0] as FakeConfig;
    expect(retriedConfig.headers?.get("Authorization")).toBe("Bearer new-access-token");
  });

  it("dedupes concurrent 401s from multiple in-flight requests into a single refresh call", async () => {
    const { apiClient } = await import("../api-client");

    transport
      .mockRejectedValueOnce(errorResponse(401, "AUTH_002", "Token expired", "/cart"))
      .mockRejectedValueOnce(errorResponse(401, "AUTH_002", "Token expired", "/wishlist"))
      .mockResolvedValueOnce(successEnvelope({ items: [] }))
      .mockResolvedValueOnce(successEnvelope([]));
    axiosPostMock.mockResolvedValueOnce({
      data: { data: { accessToken: "new-access-token", refreshToken: "new-refresh-token" } },
    });

    const [cartResult, wishlistResult] = await Promise.all([
      apiClient.get("/cart"),
      apiClient.get("/wishlist"),
    ]);

    expect(cartResult).toBeTruthy();
    expect(wishlistResult).toBeTruthy();
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(transport).toHaveBeenCalledTimes(4);
  });

  it("clears the session when the refresh call itself fails", async () => {
    const { apiClient } = await import("../api-client");
    const { useSessionStore } = await import("../../stores/session.store");

    transport.mockRejectedValueOnce(errorResponse(401, "AUTH_002", "Token expired", "/cart"));
    axiosPostMock.mockRejectedValueOnce(new Error("refresh failed"));

    await expect(apiClient.get("/cart")).rejects.toBeTruthy();

    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().accessToken).toBeNull();
    expect(useSessionStore.getState().refreshToken).toBeNull();
  });

  it("does not attempt a refresh for a 401 on an auth endpoint", async () => {
    const { apiClient } = await import("../api-client");

    transport.mockRejectedValueOnce(
      errorResponse(401, "AUTH_004", "Invalid credentials", "/auth/login"),
    );

    await expect(apiClient.post("/auth/login", {})).rejects.toMatchObject({
      code: "AUTH_004",
    });
    expect(axiosPostMock).not.toHaveBeenCalled();
  });
});
