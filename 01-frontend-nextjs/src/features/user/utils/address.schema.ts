import { z } from "zod";

export const addressSchema = z.object({
  recipientName: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  province: z.string().min(1, "Vui lòng nhập tỉnh/thành phố"),
  district: z.string().min(1, "Vui lòng nhập quận/huyện"),
  ward: z.string().min(1, "Vui lòng nhập phường/xã"),
  detailAddress: z.string().min(1, "Vui lòng nhập địa chỉ chi tiết"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
