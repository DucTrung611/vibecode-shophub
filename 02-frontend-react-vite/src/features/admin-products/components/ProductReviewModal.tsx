import { useState } from "react";
import { Modal } from "../../../shared/components/Modal";
import { Button } from "../../../shared/components/Button";
import { formatCurrency } from "../../../shared/utils/format";
import { useModerateProduct } from "../hooks/useModerateProduct";
import type { FlaggedProduct } from "../types/admin-products.types";

interface ProductReviewModalProps {
  product: FlaggedProduct | null;
  onClose: () => void;
}

export function ProductReviewModal({ product, onClose }: ProductReviewModalProps) {
  const [note, setNote] = useState("");
  const moderate = useModerateProduct(product?.id ?? 0);

  if (!product) {
    return null;
  }

  const price = product.variants[0]?.price;

  return (
    <Modal open={product !== null} onClose={onClose} title="Xem xét sản phẩm">
      <div className="mb-4 flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-hub-50">
          {product.images[0] ? (
            <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl">📦</span>
          )}
        </div>
        <div className="flex-1">
          <div className="font-sora text-sm font-extrabold text-neutral-900">{product.name}</div>
          <div className="mt-1 text-xs text-neutral-400">Shop ID: {product.shopId}</div>
          {price && (
            <div className="mt-2 text-sm font-extrabold text-neutral-900">
              {formatCurrency(Number(price))}
            </div>
          )}
        </div>
      </div>

      {product.flagReason && (
        <div className="mb-4 rounded-[10px] border-l-4 border-error bg-error-tint px-4 py-3.5">
          <div className="mb-1 text-xs font-extrabold text-error">
            ⚠ Lý do gắn cờ: {product.flagReason}
          </div>
        </div>
      )}

      <label htmlFor="moderation-note" className="mb-1.5 block text-xs font-bold font-manrope text-neutral-700">
        Ghi chú cho người bán
      </label>
      <textarea
        id="moderation-note"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Nhập ghi chú (bắt buộc khi yêu cầu chỉnh sửa)..."
        rows={3}
        className="mb-4 w-full rounded-lg border border-neutral-200 px-3.5 py-3 text-sm font-manrope text-neutral-900 outline-none focus:border-hub-500 focus:ring-3 focus:ring-hub-100"
      />

      <div className="flex flex-col gap-2">
        <Button
          variant="primary"
          className="bg-success hover:bg-success"
          isLoading={moderate.isPending}
          onClick={() => moderate.mutate({ action: "approve" }, { onSuccess: onClose })}
        >
          ✓ Duyệt sản phẩm
        </Button>
        <Button
          variant="outline"
          className="border-warning text-warning hover:bg-warning-tint"
          disabled={note.trim().length === 0}
          isLoading={moderate.isPending}
          onClick={() =>
            moderate.mutate(
              { action: "request_changes", note: note.trim() },
              { onSuccess: onClose },
            )
          }
        >
          ✎ Yêu cầu chỉnh sửa
        </Button>
        <Button
          variant="outline"
          className="border-error text-error hover:bg-error-tint"
          isLoading={moderate.isPending}
          onClick={() =>
            moderate.mutate(
              { action: "remove", note: note.trim() || undefined },
              { onSuccess: onClose },
            )
          }
        >
          ✕ Gỡ sản phẩm
        </Button>
      </div>
    </Modal>
  );
}
