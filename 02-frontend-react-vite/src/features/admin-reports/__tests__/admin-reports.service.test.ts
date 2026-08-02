import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../shared/services/api-client";
import {
  getOrderOpsReport,
  getRevenueReport,
  getUserSignupReport,
} from "../services/admin-reports.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { get: vi.fn() },
}));

describe("admin-reports.service", () => {
  it("getRevenueReport calls GET /admin/reports/revenue", async () => {
    const payload = { kpis: [], weeklyBars: [], categoryBreakdown: [], topSellers: [] };
    vi.mocked(apiClient.get).mockResolvedValue(payload);

    const result = await getRevenueReport();

    expect(apiClient.get).toHaveBeenCalledWith("/admin/reports/revenue");
    expect(result).toEqual(payload);
  });

  it("getUserSignupReport calls GET /admin/reports/users and returns a plain array", async () => {
    const payload = [{ label: "Tuần 1", value: 10 }];
    vi.mocked(apiClient.get).mockResolvedValue(payload);

    const result = await getUserSignupReport();

    expect(apiClient.get).toHaveBeenCalledWith("/admin/reports/users");
    expect(result).toEqual(payload);
  });

  it("getOrderOpsReport calls GET /admin/reports/orders and returns a plain array", async () => {
    const payload = [{ carrier: "GHN", totalShipments: 10, delivered: 9, deliveryRate: 0.9 }];
    vi.mocked(apiClient.get).mockResolvedValue(payload);

    const result = await getOrderOpsReport();

    expect(apiClient.get).toHaveBeenCalledWith("/admin/reports/orders");
    expect(result).toEqual(payload);
  });
});
