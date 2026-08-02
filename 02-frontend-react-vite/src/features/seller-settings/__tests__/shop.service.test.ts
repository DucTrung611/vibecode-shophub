import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../shared/services/api-client";
import { getMyShop, updateMyShop } from "../services/shop.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn() },
}));

describe("shop.service", () => {
  it("getMyShop calls GET /shops/me", async () => {
    const shop = { id: 1, ownerId: 2, name: "My Shop", slug: "my-shop", status: "approved" };
    vi.mocked(apiClient.get).mockResolvedValue(shop);

    const result = await getMyShop();

    expect(apiClient.get).toHaveBeenCalledWith("/shops/me");
    expect(result).toEqual(shop);
  });

  it("updateMyShop calls PATCH /shops/me with the given payload", async () => {
    const shop = { id: 1, ownerId: 2, name: "New Name", slug: "my-shop", status: "approved" };
    vi.mocked(apiClient.patch).mockResolvedValue(shop);

    const result = await updateMyShop({ name: "New Name" });

    expect(apiClient.patch).toHaveBeenCalledWith("/shops/me", { name: "New Name" });
    expect(result).toEqual(shop);
  });
});
