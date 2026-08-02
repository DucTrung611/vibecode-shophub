import { z } from "zod";

export const shopInfoSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên shop"),
  description: z.string().optional(),
});

export type ShopInfoFormValues = z.infer<typeof shopInfoSchema>;

export const shopContactSchema = z.object({
  phone: z.string().optional(),
  email: z.union([z.literal(""), z.string().email("Email không hợp lệ")]).optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  detailAddress: z.string().optional(),
});

export type ShopContactFormValues = z.infer<typeof shopContactSchema>;

export const shopShippingSchema = z.object({
  defaultCarrier: z.string().optional(),
  baseShippingFee: z.coerce.number().min(0).optional(),
});

export type ShopShippingFormValues = z.infer<typeof shopShippingSchema>;

export const shopPaymentSchema = z.object({
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolder: z.string().optional(),
});

export type ShopPaymentFormValues = z.infer<typeof shopPaymentSchema>;

export const shopNotificationSchema = z.object({
  orderUpdateEmail: z.union([z.literal(""), z.string().email("Email không hợp lệ")]).optional(),
  notifyOnNewOrder: z.boolean().optional(),
  notifyOnLowStock: z.boolean().optional(),
});

export type ShopNotificationFormValues = z.infer<typeof shopNotificationSchema>;
