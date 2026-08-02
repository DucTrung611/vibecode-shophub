import { describe, expect, it, vi } from "vitest";
import { apiClient } from "../../../shared/services/api-client";
import {
  createCategory,
  deleteCategory,
  getCategoryTree,
  updateCategory,
} from "../services/admin-categories.service";
import { flattenCategories } from "../utils/flatten-categories.util";

vi.mock("../../../shared/services/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe("admin-categories.service", () => {
  it("getCategoryTree calls GET /categories", async () => {
    const tree = [{ id: 1, name: "Điện tử", children: [] }];
    vi.mocked(apiClient.get).mockResolvedValue(tree);

    const result = await getCategoryTree();

    expect(apiClient.get).toHaveBeenCalledWith("/categories");
    expect(result).toEqual(tree);
  });

  it("createCategory calls POST /categories with the payload", async () => {
    const category = { id: 2, name: "Mới" };
    vi.mocked(apiClient.post).mockResolvedValue(category);

    const result = await createCategory({ name: "Mới" });

    expect(apiClient.post).toHaveBeenCalledWith("/categories", { name: "Mới" });
    expect(result).toEqual(category);
  });

  it("updateCategory calls PATCH /categories/:id with the payload", async () => {
    const category = { id: 2, isActive: false };
    vi.mocked(apiClient.patch).mockResolvedValue(category);

    const result = await updateCategory(2, { isActive: false });

    expect(apiClient.patch).toHaveBeenCalledWith("/categories/2", { isActive: false });
    expect(result).toEqual(category);
  });

  it("deleteCategory calls DELETE /categories/:id", async () => {
    vi.mocked(apiClient.delete).mockResolvedValue(undefined);

    await deleteCategory(2);

    expect(apiClient.delete).toHaveBeenCalledWith("/categories/2");
  });
});

describe("flattenCategories", () => {
  it("flattens a nested tree depth-first with depth tags", () => {
    const tree = [
      {
        id: 1,
        parentId: null,
        name: "Điện tử",
        slug: "dien-tu",
        sortOrder: 0,
        commissionRate: "4.5",
        isActive: true,
        createdAt: "",
        updatedAt: "",
        children: [
          {
            id: 2,
            parentId: 1,
            name: "Âm thanh",
            slug: "am-thanh",
            sortOrder: 0,
            commissionRate: "4.5",
            isActive: true,
            createdAt: "",
            updatedAt: "",
            children: [],
          },
        ],
      },
    ];

    const result = flattenCategories(tree);

    expect(result.map((c) => [c.name, c.depth])).toEqual([
      ["Điện tử", 0],
      ["Âm thanh", 1],
    ]);
  });
});
