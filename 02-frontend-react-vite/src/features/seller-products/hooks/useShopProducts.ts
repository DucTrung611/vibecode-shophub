import { useQuery } from "@tanstack/react-query";
import { getShopProducts, type ProductListParams } from "../services/product.service";

export const productKeys = {
  list: (params: ProductListParams) => ["seller-products", "list", params] as const,
  detail: (slug: string) => ["seller-products", "detail", slug] as const,
};

export function useShopProducts(params: ProductListParams | null) {
  return useQuery({
    queryKey: productKeys.list(params ?? { shopId: 0 }),
    queryFn: () => getShopProducts(params as ProductListParams),
    enabled: params !== null && params.shopId > 0,
  });
}
