"use client";

import { useRouter } from "next/navigation";
import { useSessionStore } from "../../../shared/stores/session.store";
import { useAddWishlistItem, useRemoveWishlistItem } from "../hooks/useWishlistMutations";
import { useWishlist } from "../hooks/useWishlist";

interface WishlistButtonProps {
  productId: number;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const router = useRouter();
  const accessToken = useSessionStore((state) => state.accessToken);
  const { data: wishlist } = useWishlist();
  const addItem = useAddWishlistItem();
  const removeItem = useRemoveWishlistItem();

  const isWishlisted = (wishlist ?? []).some((item) => item.productId === productId);
  const isPending = addItem.isPending || removeItem.isPending;

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!accessToken) {
      router.push("/login");
      return;
    }
    if (isWishlisted) {
      removeItem.mutate(productId);
    } else {
      addItem.mutate(productId);
    }
  };

  return (
    <button
      type="button"
      aria-label={isWishlisted ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
      onClick={handleClick}
      disabled={isPending}
      className={[
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-base shadow-sm",
        className ?? "",
      ].join(" ")}
    >
      {isWishlisted ? "❤️" : "🤍"}
    </button>
  );
}
