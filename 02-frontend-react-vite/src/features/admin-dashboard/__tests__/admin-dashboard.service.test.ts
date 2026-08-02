import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../shared/services/api-client";
import { getDashboard } from "../services/admin-dashboard.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { get: vi.fn() },
}));

describe("getDashboard", () => {
  it("calls GET /admin/dashboard and returns the unwrapped payload", async () => {
    const payload = {
      kpis: [{ label: "GMV 30 ngày", value: 100 }],
      gmvWeekly: [{ label: "T1", value: 10 }],
      needsAction: [{ label: "Gian hàng chờ duyệt", count: 3 }],
      newShops: [],
      topCategories: [],
    };
    vi.mocked(apiClient.get).mockResolvedValue(payload);

    const result = await getDashboard();

    expect(apiClient.get).toHaveBeenCalledWith("/admin/dashboard");
    expect(result).toEqual(payload);
  });
});
