import { useMemo, useState } from "react";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { Button } from "../../../shared/components/Button";
import { useCategoryTree } from "../hooks/useCategoryTree";
import { useDeleteCategory, useUpdateCategory } from "../hooks/useCategoryMutations";
import { flattenCategories } from "../utils/flatten-categories.util";
import { CategoryFormModal } from "./CategoryFormModal";
import type { FlatCategory } from "../types/admin-categories.types";

export function AdminCategoriesPage() {
  const { data, isLoading, isError } = useCategoryTree();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FlatCategory | null>(null);

  const flatCategories = useMemo(() => flattenCategories(data ?? []), [data]);

  const handleDelete = (category: FlatCategory) => {
    if (window.confirm(`Xóa danh mục "${category.name}"?`)) {
      deleteCategory.mutate(category.id);
    }
  };

  const columns: TableColumn<FlatCategory>[] = [
    {
      header: "Tên danh mục",
      accessor: "name",
      render: (row) => (
        <span
          style={{ paddingLeft: row.depth * 24 }}
          className={row.depth === 0 ? "font-bold text-neutral-900" : "font-semibold text-neutral-800"}
        >
          {row.name}
        </span>
      ),
    },
    {
      header: "Hoa hồng",
      accessor: "commissionRate",
      render: (row) => `${row.commissionRate}%`,
    },
    {
      header: "Trạng thái",
      accessor: "isActive",
      render: (row) => (
        <button
          type="button"
          role="switch"
          aria-checked={row.isActive}
          aria-label={`${row.isActive ? "Tắt" : "Bật"} danh mục ${row.name}`}
          onClick={() =>
            updateCategory.mutate({ id: row.id, payload: { isActive: !row.isActive } })
          }
          className={[
            "relative h-5 w-[34px] rounded-full transition-colors",
            row.isActive ? "bg-hub-500" : "bg-neutral-200",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-[3px] h-3.5 w-3.5 rounded-full bg-white transition-all",
              row.isActive ? "left-[17px]" : "left-[3px]",
            ].join(" ")}
          />
        </button>
      ),
    },
    {
      header: "Thao tác",
      accessor: "id",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
            className="text-xs font-bold text-hub-600"
          >
            Sửa
          </button>
          <button type="button" onClick={() => handleDelete(row)} className="text-xs font-bold text-error">
            Xóa
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          variant="primary"
          className="w-auto"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Thêm danh mục
        </Button>
      </div>

      {isError && (
        <p className="text-sm font-manrope text-error">
          Không thể tải danh sách danh mục. Vui lòng thử lại.
        </p>
      )}

      {isLoading ? (
        <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>
      ) : (
        <Table columns={columns} rows={flatCategories} rowKey={(row) => row.id} />
      )}

      {formOpen && (
        <CategoryFormModal
          key={editing?.id ?? "new"}
          open={formOpen}
          onClose={() => setFormOpen(false)}
          categories={flatCategories}
          editing={editing}
        />
      )}
    </div>
  );
}
