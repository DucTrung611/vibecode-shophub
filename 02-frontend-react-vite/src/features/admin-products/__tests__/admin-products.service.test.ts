import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../shared/services/api-client";
import { rawApiClient } from "../../../shared/services/raw-api-client";
import { listFlaggedProducts, moderateProduct } from "../services/admin-products.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { patch: vi.fn() },
}));
vi.mock("../../../shared/services/raw-api-client", () => ({
  rawApiClient: { get: vi.fn() },
}));

describe("admin-products.service", () => {
  it("listFlaggedProducts calls GET /admin/products and returns items + meta", async () => {
    const envelope = {
      success: true,
      data: [{ id: 1, name: "Product A", flagReason: "abc", images: [], variants: [] }],
      meta: { page: 1, limit: 10, total: 1 },
    };
    vi.mocked(rawApiClient.get).mockResolvedValue(envelope);

    const result = await listFlaggedProducts({ page: 1, limit: 10 });

    expect(rawApiClient.get).toHaveBeenCalledWith("/admin/products", {
      params: { page: 1, limit: 10 },
    });
    expect(result).toEqual({ items: envelope.data, meta: envelope.meta });
  });

  it("moderateProduct calls PATCH /admin/products/:id/moderate with the payload", async () => {
    const product = { id: 1, status: "active" };
    vi.mocked(apiClient.patch).mockResolvedValue(product);

    const result = await moderateProduct(1, { action: "approve" });

    expect(apiClient.patch).toHaveBeenCalledWith("/admin/products/1/moderate", {
      action: "approve",
    });
    expect(result).toEqual(product);
  });
});
