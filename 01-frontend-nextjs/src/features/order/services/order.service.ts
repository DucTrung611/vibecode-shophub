import { apiClient } from "../../../shared/services/api-client";
import type { ApiResult } from "../../../shared/types/api-response.types";
import type {
  CheckoutInput,
  CheckoutResult,
  OrderDetail,
  OrderListItem,
  OrderStatus,
} from "../types/order.types";

export async function checkout(input: CheckoutInput): Promise<CheckoutResult> {
  const result = (await apiClient.post(
    "/checkout",
    input,
  )) as unknown as ApiResult<CheckoutResult>;
  return result.data;
}

export async function getOrders(status?: OrderStatus): Promise<OrderListItem[]> {
  const result = (await apiClient.get("/orders", {
    params: status ? { status } : {},
  })) as unknown as ApiResult<OrderListItem[]>;
  return result.data;
}

export async function getOrderById(id: number): Promise<OrderDetail> {
  const result = (await apiClient.get(
    `/orders/${id}`,
  )) as unknown as ApiResult<OrderDetail>;
  return result.data;
}

export async function cancelOrder(id: number): Promise<{ id: number; status: string }> {
  const result = (await apiClient.patch(
    `/orders/${id}/cancel`,
  )) as unknown as ApiResult<{ id: number; status: string }>;
  return result.data;
}
