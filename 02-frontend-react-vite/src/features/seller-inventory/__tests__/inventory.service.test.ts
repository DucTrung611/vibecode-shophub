import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../shared/services/api-client";
import { getInventorySummary } from "../services/inventory.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { get: vi.fn() },
}));

describe("getInventorySummary", () => {
  it("omits the status param when filter is 'all'", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      totalSkus: 0,
      outOfStock: 0,
      lowStock: 0,
      items: [],
    });

    await getInventorySummary("all");

    expect(apiClient.get).toHaveBeenCalledWith("/shops/me/inventory/summary", {
      params: undefined,
    });
  });

  it("passes the status param when a specific filter is given", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      totalSkus: 1,
      outOfStock: 0,
      lowStock: 1,
      items: [],
    });

    await getInventorySummary("low_stock");

    expect(apiClient.get).toHaveBeenCalledWith("/shops/me/inventory/summary", {
      params: { status: "low_stock" },
    });
  });
});
