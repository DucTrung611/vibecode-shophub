export interface Shop {
  id: number;
  ownerId: number;
  name: string;
  slug: string;
  status: string;
  ratingAvg?: number;
  totalSold?: number;
  businessLicenseUrl?: string | null;
  documents?: unknown;
  rejectionReason?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  detailAddress?: string | null;
  shippingSettings?: ShippingSettings | null;
  paymentSettings?: PaymentSettings | null;
  notificationSettings?: NotificationSettings | null;
}

export interface ShippingSettings {
  defaultCarrier?: string;
  baseShippingFee?: number;
}

export interface PaymentSettings {
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
}

export interface NotificationSettings {
  orderUpdateEmail?: string;
  notifyOnNewOrder?: boolean;
  notifyOnLowStock?: boolean;
}

export interface UpdateShopPayload {
  name?: string;
  description?: string;
  phone?: string;
  email?: string;
  province?: string;
  district?: string;
  ward?: string;
  detailAddress?: string;
  shippingSettings?: ShippingSettings;
  paymentSettings?: PaymentSettings;
  notificationSettings?: NotificationSettings;
}
