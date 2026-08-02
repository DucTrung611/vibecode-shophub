export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderListItem {
  id: number;
  orderCode: string;
  buyerId: number;
  shopId: number;
  status: OrderStatus;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  createdAt: string;
}

export interface ShippingAddressSnapshot {
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detailAddress: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  variantId: number;
  productNameSnapshot: string;
  variantAttrsSnapshot: Record<string, string>;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  method: string;
  amount: number;
  status: string;
  paidAt: string | null;
}

export interface Shipment {
  id: number;
  carrier: string | null;
  trackingNumber: string | null;
  status: string;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface OrderDetail extends OrderListItem {
  shippingAddress: ShippingAddressSnapshot;
  items: OrderItem[];
  payments: Payment[];
  shipments: Shipment[];
}
