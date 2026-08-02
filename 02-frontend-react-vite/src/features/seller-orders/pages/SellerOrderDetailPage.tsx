import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Badge } from "../../../shared/components/Badge";
import { Card } from "../../../shared/components/Card";
import { Table, type TableColumn } from "../../../shared/components/Table";
import { formatCurrency, formatDateTime } from "../../../shared/utils/format";
import { OrderStatusUpdateForm } from "../components/OrderStatusUpdateForm";
import { useOrderDetail } from "../hooks/useOrderDetail";
import type { OrderItem } from "../types/order.types";
import { orderStatusLabel, orderStatusVariant } from "../utils/order-status.util";

export function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const { data: order, isLoading, isError } = useOrderDetail(orderId);

  const columns: TableColumn<OrderItem>[] = [
    { header: "Sản phẩm", accessor: "productNameSnapshot" },
    {
      header: "Phân loại",
      accessor: "variantAttrsSnapshot",
      render: (row) =>
        Object.entries(row.variantAttrsSnapshot ?? {})
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ") || "—",
    },
    { header: "Đơn giá", accessor: "unitPrice", render: (row) => formatCurrency(row.unitPrice) },
    { header: "SL", accessor: "quantity" },
    { header: "Thành tiền", accessor: "subtotal", render: (row) => formatCurrency(row.subtotal) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/seller/orders"
        className="flex w-fit items-center gap-1.5 text-sm font-bold font-manrope text-hub-600 hover:underline"
      >
        <ArrowLeft size={15} />
        Quay lại danh sách đơn hàng
      </Link>

      {isLoading && <p className="text-sm font-manrope text-neutral-500">Đang tải...</p>}
      {isError && (
        <p className="text-sm font-manrope text-error">Không thể tải chi tiết đơn hàng.</p>
      )}

      {order && (
        <>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-sora text-lg font-extrabold text-neutral-900">
                  Đơn hàng {order.orderCode}
                </h1>
                <p className="text-xs font-manrope text-neutral-500">
                  Đặt lúc {formatDateTime(order.createdAt)}
                </p>
              </div>
              <Badge variant={orderStatusVariant(order.status)}>
                {orderStatusLabel(order.status)}
              </Badge>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="flex flex-col gap-5 xl:col-span-2">
              <Card padded={false}>
                <div className="border-b border-neutral-200 p-5">
                  <h2 className="font-sora text-base font-extrabold text-neutral-900">
                    Sản phẩm
                  </h2>
                </div>
                <div className="p-5">
                  <Table columns={columns} rows={order.items} rowKey={(row) => row.id} />
                </div>
              </Card>

              <Card>
                <h2 className="mb-3 font-sora text-base font-extrabold text-neutral-900">
                  Địa chỉ giao hàng
                </h2>
                <p className="text-sm font-manrope text-neutral-800">
                  {order.shippingAddress.recipientName} · {order.shippingAddress.phone}
                </p>
                <p className="text-sm font-manrope text-neutral-600">
                  {order.shippingAddress.detailAddress}, {order.shippingAddress.ward},{" "}
                  {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
              </Card>
            </div>

            <div className="flex flex-col gap-5">
              <Card>
                <h2 className="mb-3 font-sora text-base font-extrabold text-neutral-900">
                  Tổng cộng
                </h2>
                <div className="flex flex-col gap-2 text-sm font-manrope">
                  <div className="flex justify-between text-neutral-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Phí vận chuyển</span>
                    <span>{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-100 pt-2 font-bold text-neutral-900">
                    <span>Tổng tiền</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="mb-3 font-sora text-base font-extrabold text-neutral-900">
                  Cập nhật trạng thái
                </h2>
                <OrderStatusUpdateForm orderId={order.id} currentStatus={order.status} />
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
