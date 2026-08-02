import { apiClient } from "../../../shared/services/api-client";
import type { Shop, UpdateShopPayload } from "../types/shop.types";

export async function getMyShop(): Promise<Shop> {
  const response = await apiClient.get("/shops/me");
  return response as unknown as Shop;
}

export async function updateMyShop(payload: UpdateShopPayload): Promise<Shop> {
  const response = await apiClient.patch("/shops/me", payload);
  return response as unknown as Shop;
}

async function uploadShopImage(field: "logo" | "banner", file: File): Promise<Shop> {
  const formData = new FormData();
  formData.append(field, file);
  const response = await apiClient.post(`/shops/me/${field}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response as unknown as Shop;
}

export function uploadShopLogo(file: File): Promise<Shop> {
  return uploadShopImage("logo", file);
}

export function uploadShopBanner(file: File): Promise<Shop> {
  return uploadShopImage("banner", file);
}
