export { WishlistButton } from "./components/WishlistButton";
export { WishlistGrid } from "./components/WishlistGrid";
export { useWishlist, WISHLIST_QUERY_KEY } from "./hooks/useWishlist";
export { useAddWishlistItem, useRemoveWishlistItem } from "./hooks/useWishlistMutations";
export * as wishlistService from "./services/wishlist.service";
export type { WishlistItem, WishlistProduct } from "./types/wishlist.types";
