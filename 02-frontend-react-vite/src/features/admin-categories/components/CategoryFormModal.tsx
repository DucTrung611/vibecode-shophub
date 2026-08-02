import { useState } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Input } from "../../../shared/components/Input";
import { Button } from "../../../shared/components/Button";
import { useCreateCategory, useUpdateCategory } from "../hooks/useCategoryMutations";
import type { FlatCategory } from "../types/admin-categories.types";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  categories: FlatCategory[];
  editing: FlatCategory | null;
}

// The parent (AdminCategoriesPage) only mounts this component while `open` is true,
// remounting it fresh each time (keyed by `editing?.id ?? "new"`) — so form state can be
// initialized straight from `editing` via lazy useState, with no effect-based reset needed.
export function CategoryFormModal({ open, onClose, categories, editing }: CategoryFormModalProps) {
  const [name, setName] = useState(() => editing?.name ?? "");
  const [parentId, setParentId] = useState<string>(() =>
    editing?.parentId ? String(editing.parentId) : "",
  );
  const [commissionRate, setCommissionRate] = useState(() => editing?.commissionRate ?? "0");

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const handleSubmit = () => {
    const payload = {
      name: name.trim(),
      parentId: parentId ? Number(parentId) : undefined,
      commissionRate: Number(commissionRate),
    };
    if (editing) {
      updateCategory.mutate({ id: editing.id, payload }, { onSuccess: onClose });
    } else {
      createCategory.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Sửa danh mục" : "Danh mục mới"}>
      <div className="flex flex-col gap-3.5">
        <Input
          id="category-name"
          label="Tên danh mục"
          placeholder="VD: Đồ gia dụng thông minh"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category-parent" className="text-xs font-bold font-manrope text-neutral-700">
            Danh mục cha
          </label>
          <select
            id="category-parent"
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            className="rounded-[9px] border border-neutral-200 px-3.5 py-3 text-sm font-manrope text-neutral-900 outline-none focus:border-hub-500 focus:ring-3 focus:ring-hub-100"
          >
            <option value="">— Không có (danh mục gốc) —</option>
            {categories
              .filter((category) => category.id !== editing?.id)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {"— ".repeat(category.depth)}
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <Input
          id="category-commission"
          type="number"
          step="0.1"
          min="0"
          label="Tỷ lệ hoa hồng (%)"
          value={commissionRate}
          onChange={(event) => setCommissionRate(event.target.value)}
        />

        <Button
          variant="primary"
          className="mt-1.5"
          disabled={name.trim().length < 2}
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          Lưu danh mục
        </Button>
      </div>
    </Modal>
  );
}
