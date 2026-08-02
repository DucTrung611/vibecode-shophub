import { describe, expect, it, vi } from "vitest";
import { apiClient, rawApiClient } from "../../../shared/services/api-client";
import { createProduct, getShopProducts } from "../services/product.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { post: vi.fn() },
  rawApiClient: { get: vi.fn() },
}));

describe("product.service", () => {
  it("getShopProducts always scopes by shopId and omits unset filters", async () => {
    vi.mocked(rawApiClient.get).mockResolvedValue({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0 },
    });

    await getShopProducts({ shopId: 8, page: 1, limit: 20 });

    expect(rawApiClient.get).toHaveBeenCalledWith("/products", {
      params: { shopId: 8, page: 1, limit: 20 },
    });
  });

  it("getShopProducts includes categoryId and status when provided", async () => {
    vi.mocked(rawApiClient.get).mockResolvedValue({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0 },
    });

    await getShopProducts({ shopId: 8, categoryId: 3, status: "active", page: 2, limit: 10 });

    expect(rawApiClient.get).toHaveBeenCalledWith("/products", {
      params: { shopId: 8, categoryId: 3, status: "active", page: 2, limit: 10 },
    });
  });

  it("createProduct POSTs to /products with name and categoryId", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 1, slug: "test", status: "draft" });

    const result = await createProduct({ name: "Test", categoryId: 3 });

    expect(apiClient.post).toHaveBeenCalledWith("/products", { name: "Test", categoryId: 3 });
    expect(result.slug).toBe("test");
  });
});
