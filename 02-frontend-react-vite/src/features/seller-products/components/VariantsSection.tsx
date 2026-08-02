import { useState } from "react";
import { Plus, SquarePen } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { formatCurrency } from "../../../shared/utils/format";
import { formatAttributeLabel } from "../../../shared/utils/variant-attribute-label";
import { useCreateVariant, useUpdateVariant } from "../hooks/useVariantMutations";
import type { ProductVariant } from "../types/product.types";
import { VariantFormModal } from "./VariantFormModal";

interface VariantsSectionProps {
  productId: number;
  slug: string;
  variants: ProductVariant[];
}

export function VariantsSection({ productId, slug, variants }: VariantsSectionProps) {
  const [modalVariant, setModalVariant] = useState<ProductVariant | "new" | null>(null);
  const createVariant = useCreateVariant(productId, slug);
  const updateVariant = useUpdateVariant(productId, slug);

  const columns: TableColumn<ProductVariant>[] = [
    { header: "SKU", accessor: "sku" },
    {
      header: "Thuộc tính",
      accessor: "attributes",
      render: (row) =>
        Object.entries(row.attributes ?? {})
          .filter(([, value]) => value)
          .map(([key, value]) => `${formatAttributeLabel(key)}: ${value}`)
          .join(", ") || "—",
    },
    { header: "Giá bán", accessor: "price", render: (row) => formatCurrency(row.price) },
    { header: "Tồn kho", accessor: "stockQuantity" },
    {
      header: "",
      accessor: "id",
      render: (row) => (
        <button
          type="button"
          aria-label="Sửa phân loại"
          onClick={() => setModalVariant(row)}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-hub-600"
        >
          <SquarePen size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold font-manrope text-neutral-700">Phân loại sản phẩm</span>
        <div className="w-fit">
          <Button type="button" variant="outline" onClick={() => setModalVariant("new")}>
            <span className="flex items-center gap-1.5">
              <Plus size={14} />
              Thêm phân loại
            </span>
          </Button>
        </div>
      </div>

      <Table columns={columns} rows={variants} rowKey={(row) => row.id} />

      <VariantFormModal
        open={modalVariant !== null}
        onClose={() => setModalVariant(null)}
        variant={modalVariant && modalVariant !== "new" ? modalVariant : undefined}
        isSubmitting={createVariant.isPending || updateVariant.isPending}
        onSubmit={(values) => {
          const attributes: Record<string, string> = {};
          if (values.color) attributes.color = values.color;
          if (values.size) attributes.size = values.size;

          if (modalVariant === "new") {
            createVariant.mutate(
              {
                sku: values.sku,
                attributes,
                price: values.price,
                compareAtPrice: values.compareAtPrice,
                stockQuantity: values.stockQuantity,
              },
              { onSuccess: () => setModalVariant(null) },
            );
          } else if (modalVariant) {
            updateVariant.mutate(
              {
                variantId: modalVariant.id,
                payload: {
                  price: values.price,
                  compareAtPrice: values.compareAtPrice,
                  stockQuantity: values.stockQuantity,
                },
              },
              { onSuccess: () => setModalVariant(null) },
            );
          }
        }}
      />
    </div>
  );
}
