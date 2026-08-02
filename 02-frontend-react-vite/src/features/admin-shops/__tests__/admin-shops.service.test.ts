import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../shared/services/api-client";
import { rawApiClient } from "../../../shared/services/raw-api-client";
import { getShopDetail, listShops, updateShopStatus } from "../services/admin-shops.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { get: vi.fn(), patch: vi.fn() },
}));
vi.mock("../../../shared/services/raw-api-client", () => ({
  rawApiClient: { get: vi.fn() },
}));

describe("admin-shops.service", () => {
  it("listShops calls GET /admin/shops with query params and returns items + meta", async () => {
    const envelope = {
      success: true,
      data: [{ id: 1, name: "Shop A", status: "pending" }],
      meta: { page: 1, limit: 10, total: 1 },
    };
    vi.mocked(rawApiClient.get).mockResolvedValue(envelope);

    const result = await listShops({ page: 1, limit: 10, status: "pending" });

    expect(rawApiClient.get).toHaveBeenCalledWith("/admin/shops", {
      params: { page: 1, limit: 10, status: "pending" },
    });
    expect(result).toEqual({ items: envelope.data, meta: envelope.meta });
  });

  it("getShopDetail calls GET /admin/shops/:id", async () => {
    const shop = { id: 1, name: "Shop A" };
    vi.mocked(apiClient.get).mockResolvedValue(shop);

    const result = await getShopDetail(1);

    expect(apiClient.get).toHaveBeenCalledWith("/admin/shops/1");
    expect(result).toEqual(shop);
  });

  it("updateShopStatus calls PATCH /admin/shops/:id/status with the payload", async () => {
    const shop = { id: 1, status: "rejected" };
    vi.mocked(apiClient.patch).mockResolvedValue(shop);

    const result = await updateShopStatus(1, { status: "rejected", rejectionReason: "abc" });

    expect(apiClient.patch).toHaveBeenCalledWith("/admin/shops/1/status", {
      status: "rejected",
      rejectionReason: "abc",
    });
    expect(result).toEqual(shop);
  });
});
