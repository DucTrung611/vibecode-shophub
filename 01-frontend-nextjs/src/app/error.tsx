"use client";

import { useEffect } from "react";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    // Logged for now; swap for a real error-reporting sink when one exists.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-4xl">⚠️</span>
      <h1 className="text-lg font-bold font-sora text-neutral-900">
        Đã có lỗi xảy ra
      </h1>
      <p className="max-w-sm text-sm font-manrope text-neutral-500">
        Rất tiếc, đã có lỗi ngoài ý muốn. Vui lòng thử lại sau.
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
