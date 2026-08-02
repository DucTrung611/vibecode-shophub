import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "../services/product.service";
import { productKeys } from "./useShopProducts";

export function useProductDetail(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(slug ?? ""),
    queryFn: () => getProductBySlug(slug as string),
    enabled: !!slug,
  });
}
