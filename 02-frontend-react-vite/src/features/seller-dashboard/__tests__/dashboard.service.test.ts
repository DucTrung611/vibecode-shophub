import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../shared/services/api-client";
import { getSellerDashboard } from "../services/dashboard.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { get: vi.fn() },
}));

describe("getSellerDashboard", () => {
  it("calls GET /shops/me/dashboard and returns the unwrapped payload", async () => {
    const payload = {
      kpis: [{ label: "Doanh thu", value: 1000000 }],
      revenueBars: [{ label: "T2", value: 100000 }],
      orderStatusBreakdown: [{ status: "pending", count: 2 }],
      recentOrders: [],
      topProducts: [],
    };
    vi.mocked(apiClient.get).mockResolvedValue(payload);

    const result = await getSellerDashboard();

    expect(apiClient.get).toHaveBeenCalledWith("/shops/me/dashboard");
    expect(result).toEqual(payload);
  });
});
