import { useQuery } from "@tanstack/react-query";
import { getMyShop } from "../services/shop.service";

export const shopKeys = {
  me: ["seller-shop", "me"] as const,
};

export function useMyShop() {
  return useQuery({
    queryKey: shopKeys.me,
    queryFn: getMyShop,
    staleTime: 5 * 60 * 1000,
  });
}
