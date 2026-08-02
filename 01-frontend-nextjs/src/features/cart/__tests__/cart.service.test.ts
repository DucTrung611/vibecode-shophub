import { describe, expect, it, vi } from "vitest";
import * as cartService from "../services/cart.service";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "../../../shared/services/api-client";

const mockedApiClient = vi.mocked(apiClient, true);

describe("cart.service", () => {
  it("getCart calls GET /cart and unwraps the envelope", async () => {
    const cart = { id: 1, items: [] };
    mockedApiClient.get.mockResolvedValueOnce({ data: cart, meta: null });

    const result = await cartService.getCart();

    expect(mockedApiClient.get).toHaveBeenCalledWith("/cart");
    expect(result).toEqual(cart);
  });

  it("addCartItem posts variantId/quantity to /cart/items", async () => {
    const cart = { id: 1, items: [{ id: 10 }] };
    mockedApiClient.post.mockResolvedValueOnce({ data: cart, meta: null });

    const result = await cartService.addCartItem(5, 2);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/cart/items", {
      variantId: 5,
      quantity: 2,
    });
    expect(result).toEqual(cart);
  });

  it("updateCartItem patches the item's quantity", async () => {
    const cart = { id: 1, items: [] };
    mockedApiClient.patch.mockResolvedValueOnce({ data: cart, meta: null });

    await cartService.updateCartItem(10, 3);

    expect(mockedApiClient.patch).toHaveBeenCalledWith("/cart/items/10", { quantity: 3 });
  });

  it("removeCartItem deletes the item by id", async () => {
    const cart = { id: 1, items: [] };
    mockedApiClient.delete.mockResolvedValueOnce({ data: cart, meta: null });

    await cartService.removeCartItem(10);

    expect(mockedApiClient.delete).toHaveBeenCalledWith("/cart/items/10");
  });
});
