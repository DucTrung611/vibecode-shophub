import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { FileText } from "lucide-react";
import { Card } from "../../../shared/components/Card";
import { Badge, type BadgeVariant } from "../../../shared/components/Badge";
import { Button } from "../../../shared/components/Button";
import { formatDate } from "../../../shared/utils/format";
import { useAdminShopDetail } from "../hooks/useAdminShopDetail";
import { useUpdateShopStatus } from "../hooks/useUpdateShopStatus";
import { ShopRejectModal } from "./ShopRejectModal";
import type { ShopStatus } from "../types/admin-shops.types";

const STATUS_META: Record<ShopStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Chờ duyệt", variant: "warning" },
  approved: { label: "Đã duyệt", variant: "success" },
  suspended: { label: "Tạm ngưng", variant: "neutral" },
  rejected: { label: "Từ chối", variant: "error" },
};

function extractDocuments(documents: unknown): { name: string; url?: string }[] {
  if (!documents) return [];
  if (Array.isArray(documents)) {
    return documents
      .map((doc) => {
        if (typeof doc === "string") return { name: doc };
        if (doc && typeof doc === "object" && "name" in doc) {
          const record = doc as Record<string, unknown>;
          return { name: String(record.name), url: typeof record.url === "string" ? record.url : undefined };
        }
        return null;
      })
      .filter((doc): doc is { name: string; url?: string } => doc !== null);
  }
  return [];
}

export function AdminShopDetailPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = Number(params.id);
  const [rejectOpen, setRejectOpen] = useState(false);

  const { data: shop, isLoading, isError } = useAdminShopDetail(id);
  const updateStatus = useUpdateShopStatus(id);

  if (isLoading) {
    return <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>;
  }

  if (isError || !shop) {
    return (
      <p className="text-sm font-manrope text-error">
        Không tìm thấy gian hàng. Vui lòng quay lại danh sách.
      </p>
    );
  }

  const statusMeta = STATUS_META[shop.status];
  const documents = extractDocuments(shop.documents);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => navigate("/admin/shops")}
        className="w-fit text-sm font-bold font-manrope text-hub-600"
      >
        ← Quay lại danh sách
      </button>

      <div className="grid grid-cols-[1fr_340px] gap-5">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-hub-500 font-sora text-xl font-extrabold text-white">
                {shop.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-sora text-base font-extrabold text-neutral-900">
                  {shop.name}
                </div>
                <div className="text-xs text-neutral-400">
                  Nộp đơn {formatDate(shop.createdAt)}
                </div>
              </div>
              <Badge variant={statusMeta.variant} className="ml-auto">
                {statusMeta.label}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <div className="text-[11px] text-neutral-400">Owner ID</div>
                <div className="text-sm font-semibold text-neutral-900">{shop.ownerId}</div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Slug</div>
                <div className="text-sm font-semibold text-neutral-900">{shop.slug}</div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Đánh giá</div>
                <div className="text-sm font-semibold text-neutral-900">{shop.ratingAvg}</div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-400">Đã bán</div>
                <div className="text-sm font-semibold text-neutral-900">{shop.totalSold}</div>
              </div>
            </div>
            {shop.rejectionReason && (
              <div className="mt-4 rounded-lg bg-error-tint px-3.5 py-2.5 text-xs font-manrope text-error">
                Lý do từ chối trước đó: {shop.rejectionReason}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-3.5 font-sora text-sm font-extrabold text-neutral-900">
              Giấy tờ đã nộp
            </h2>
            {shop.businessLicenseUrl && (
              <a
                href={shop.businessLicenseUrl}
                target="_blank"
                rel="noreferrer"
                className="mb-2.5 flex items-center gap-3 rounded-[10px] border border-neutral-100 p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hub-50">
                  <FileText size={18} className="text-hub-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-neutral-900">Giấy phép kinh doanh</div>
                  <div className="text-[11px] text-neutral-400">{shop.businessLicenseUrl}</div>
                </div>
                <span className="text-xs font-bold text-hub-600">Xem</span>
              </a>
            )}
            {documents.map((doc) => (
              <div
                key={doc.name}
                className="mb-2.5 flex items-center gap-3 rounded-[10px] border border-neutral-100 p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-hub-50">
                  <FileText size={18} className="text-hub-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-neutral-900">{doc.name}</div>
                </div>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-hub-600">
                    Xem
                  </a>
                )}
              </div>
            ))}
            {!shop.businessLicenseUrl && documents.length === 0 && (
              <p className="text-sm font-manrope text-neutral-400">Chưa có tài liệu</p>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="mb-3.5 font-sora text-sm font-extrabold text-neutral-900">
              Quyết định duyệt
            </h2>
            <div className="flex flex-col gap-2">
              <Button
                variant="primary"
                className="bg-success hover:bg-success"
                disabled={shop.status === "approved" || updateStatus.isPending}
                onClick={() => updateStatus.mutate({ status: "approved" })}
              >
                ✓ Phê duyệt gian hàng
              </Button>
              <Button
                variant="outline"
                className="border-error text-error hover:bg-error-tint"
                disabled={shop.status === "rejected" || updateStatus.isPending}
                onClick={() => setRejectOpen(true)}
              >
                ✕ Từ chối
              </Button>
              {shop.status === "approved" && (
                <Button
                  variant="outline"
                  disabled={updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ status: "suspended" })}
                >
                  Tạm ngưng gian hàng
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <ShopRejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        isSubmitting={updateStatus.isPending}
        onSubmit={(reason) => {
          updateStatus.mutate(
            { status: "rejected", rejectionReason: reason },
            { onSuccess: () => setRejectOpen(false) },
          );
        }}
      />
    </div>
  );
}
