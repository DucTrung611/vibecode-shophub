import { describe, expect, it, vi } from "vitest";
import * as authService from "../services/auth.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

import { apiClient } from "../../../shared/services/api-client";

const mockedApiClient = vi.mocked(apiClient, true);

describe("auth.service", () => {
  it("login posts credentials to /auth/login and returns the unwrapped data", async () => {
    const authResponse = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: { id: 1, fullName: "Nguyen Van A", role: "buyer" },
    };
    mockedApiClient.post.mockResolvedValueOnce({ data: authResponse, meta: null });

    const result = await authService.login({
      email: "buyer@example.com",
      password: "secret123",
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "buyer@example.com",
      password: "secret123",
    });
    expect(result).toEqual(authResponse);
  });

  it("register posts the form values (minus agreeTerms) to /auth/register", async () => {
    const authResponse = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: { id: 2, fullName: "Tran Thi B", role: "buyer" },
    };
    mockedApiClient.post.mockResolvedValueOnce({ data: authResponse, meta: null });

    const result = await authService.register({
      fullName: "Tran Thi B",
      email: "b@example.com",
      phone: "0900000000",
      password: "secret123",
    });

    expect(mockedApiClient.post).toHaveBeenCalledWith("/auth/register", {
      fullName: "Tran Thi B",
      email: "b@example.com",
      phone: "0900000000",
      password: "secret123",
    });
    expect(result).toEqual(authResponse);
  });

  it("logout posts to /auth/logout", async () => {
    mockedApiClient.post.mockResolvedValueOnce({ data: undefined, meta: null });

    await authService.logout();

    expect(mockedApiClient.post).toHaveBeenCalledWith("/auth/logout");
  });
});
