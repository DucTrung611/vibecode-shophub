"use client";

import { useEffect } from "react";

interface ProductsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsError({ error, reset }: ProductsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 px-4 py-20 text-center md:px-6">
      <span className="text-4xl">⚠️</span>
      <p className="font-manrope text-neutral-500">
        Không thể tải danh sách sản phẩm. Vui lòng thử lại.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-hub-500 px-5 py-2 text-sm font-bold font-manrope text-white"
      >
        Thử lại
      </button>
    </div>
  );
}
