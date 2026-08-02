import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../shared/services/api-client";
import { rawApiClient } from "../../../shared/services/raw-api-client";
import { listUsers, updateUserStatus } from "../services/admin-users.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { patch: vi.fn() },
}));
vi.mock("../../../shared/services/raw-api-client", () => ({
  rawApiClient: { get: vi.fn() },
}));

describe("admin-users.service", () => {
  it("listUsers calls GET /admin/users with query params and returns items + meta", async () => {
    const envelope = {
      success: true,
      data: [{ id: 1, email: "a@b.com", phone: null, fullName: "A", role: "buyer", isActive: true, createdAt: "2026-01-01" }],
      meta: { page: 1, limit: 10, total: 1 },
    };
    vi.mocked(rawApiClient.get).mockResolvedValue(envelope);

    const result = await listUsers({ page: 1, limit: 10 });

    expect(rawApiClient.get).toHaveBeenCalledWith("/admin/users", {
      params: { page: 1, limit: 10 },
    });
    expect(result).toEqual({ items: envelope.data, meta: envelope.meta });
  });

  it("updateUserStatus calls PATCH /admin/users/:id/status with isActive", async () => {
    const user = { id: 1, email: "a@b.com", phone: null, fullName: "A", role: "buyer", isActive: false, createdAt: "2026-01-01" };
    vi.mocked(apiClient.patch).mockResolvedValue(user);

    const result = await updateUserStatus(1, false);

    expect(apiClient.patch).toHaveBeenCalledWith("/admin/users/1/status", { isActive: false });
    expect(result).toEqual(user);
  });
});
