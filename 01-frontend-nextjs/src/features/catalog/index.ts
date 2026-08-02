export { CategoryGrid } from "./components/CategoryGrid";
export { FilterBar } from "./components/FilterBar";
export { ProductCard } from "./components/ProductCard";
export { ProductGrid } from "./components/ProductGrid";
export { useCategories } from "./hooks/useCategories";
export { useProducts } from "./hooks/useProducts";
export * as catalogService from "./services/catalog.service";
export type {
  Category,
  ProductDetail,
  ProductImage,
  ProductListFilters,
  ProductListItem,
  ProductListResult,
  ProductVariant,
} from "./types/catalog.types";
