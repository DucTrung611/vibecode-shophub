import { z } from "zod";

export const shopInfoSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên shop"),
});

export type ShopInfoFormValues = z.infer<typeof shopInfoSchema>;
