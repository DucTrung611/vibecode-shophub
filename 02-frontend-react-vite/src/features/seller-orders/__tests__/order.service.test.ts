import { describe, expect, it, vi } from "vitest";
import { apiClient, rawApiClient } from "../../../shared/services/api-client";
import { getMyShopOrders, updateOrderStatus } from "../services/order.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { patch: vi.fn() },
  rawApiClient: { get: vi.fn() },
}));

describe("order.service", () => {
  it("getMyShopOrders omits status when filter is 'all' and returns orders+meta", async () => {
    vi.mocked(rawApiClient.get).mockResolvedValue({
      success: true,
      data: [{ id: 1, orderCode: "SH-1" }],
      meta: { page: 1, limit: 20, total: 1 },
    });

    const result = await getMyShopOrders({ status: "all", page: 1, limit: 20 });

    expect(rawApiClient.get).toHaveBeenCalledWith("/shops/me/orders", {
      params: { page: 1, limit: 20 },
    });
    expect(result.orders).toHaveLength(1);
    expect(result.meta).toEqual({ page: 1, limit: 20, total: 1 });
  });

  it("getMyShopOrders passes status when a specific filter is given", async () => {
    vi.mocked(rawApiClient.get).mockResolvedValue({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0 },
    });

    await getMyShopOrders({ status: "pending", page: 2, limit: 10 });

    expect(rawApiClient.get).toHaveBeenCalledWith("/shops/me/orders", {
      params: { page: 2, limit: 10, status: "pending" },
    });
  });

  it("updateOrderStatus PATCHes /orders/:id/status with the payload", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ id: 5, status: "confirmed", updatedAt: "now" });

    const result = await updateOrderStatus(5, { status: "confirmed" });

    expect(apiClient.patch).toHaveBeenCalledWith("/orders/5/status", { status: "confirmed" });
    expect(result.status).toBe("confirmed");
  });
});
