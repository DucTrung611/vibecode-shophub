import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  phone: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
