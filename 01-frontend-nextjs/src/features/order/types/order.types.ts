export interface CheckoutInput {
  addressId: number;
  paymentMethod: string;
  voucherCode?: string;
  cartItemIds: number[];
}

export interface CheckoutOrderResult {
  id: number;
  shopId: number;
  orderCode: string;
  totalAmount: number;
  status: string;
}

export interface CheckoutResult {
  orderGroupId: number;
  orders: CheckoutOrderResult[];
  grandTotal: number;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId: number;
  productNameSnapshot: string;
  variantAttrsSnapshot: Record<string, string>;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface Shipment {
  id: number;
  orderId: number;
  carrier: string | null;
  trackingNumber: string | null;
  status: string;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface Payment {
  id: number;
  orderId: number;
  method: string;
  amount: string;
  status: string;
  paidAt: string | null;
}

export interface ShippingAddressSnapshot {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
}

export interface OrderListItem {
  id: number;
  orderGroupId: number;
  orderCode: string;
  buyerId: number;
  shopId: number;
  status: OrderStatus;
  paymentStatus: string;
  subtotal: string;
  shippingFee: string;
  totalAmount: string;
  shippingAddress: ShippingAddressSnapshot;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderDetail extends OrderListItem {
  payments: Payment[];
  shipments: Shipment[];
}
