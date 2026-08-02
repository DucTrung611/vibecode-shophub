import { apiClient, rawApiClient } from "../../../shared/services/api-client";
import type { ApiSuccess, PaginatedMeta } from "../../../shared/types/api-response.types";
import type { OrderDetail, OrderListItem, OrderStatus } from "../types/order.types";

export interface OrderListParams {
  status?: OrderStatus | "all";
  page?: number;
  limit?: number;
}

export interface OrderStatusUpdatePayload {
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
}

export interface OrderStatusUpdateResult {
  id: number;
  status: OrderStatus;
  updatedAt: string;
}

export async function getMyShopOrders(
  params: OrderListParams,
): Promise<{ orders: OrderListItem[]; meta: PaginatedMeta }> {
  const { status, page = 1, limit = 20 } = params;
  const query: Record<string, unknown> = { page, limit };
  if (status && status !== "all") {
    query.status = status;
  }
  const response = await rawApiClient.get("/shops/me/orders", { params: query });
  const envelope = response as unknown as ApiSuccess<OrderListItem[]>;
  return {
    orders: envelope.data,
    meta: envelope.meta ?? { page, limit, total: envelope.data.length },
  };
}

export async function getOrderDetail(id: number): Promise<OrderDetail> {
  const response = await apiClient.get(`/orders/${id}`);
  return response as unknown as OrderDetail;
}

export async function updateOrderStatus(
  id: number,
  payload: OrderStatusUpdatePayload,
): Promise<OrderStatusUpdateResult> {
  const response = await apiClient.patch(`/orders/${id}/status`, payload);
  return response as unknown as OrderStatusUpdateResult;
}
