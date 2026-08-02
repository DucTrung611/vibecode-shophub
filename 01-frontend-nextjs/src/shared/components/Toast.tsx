"use client";

import { useEffect } from "react";
import { useToastStore, type Toast as ToastEntry } from "@/shared/services/notify";

const VARIANT_STYLES: Record<ToastEntry["variant"], string> = {
  success: "border-success bg-white text-success",
  error: "border-error bg-white text-error",
  info: "border-hub-500 bg-white text-hub-600",
};

const AUTO_DISMISS_MS = 4000;

function ToastItem({ toast }: { toast: ToastEntry }) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div
      role="alert"
      className={[
        "pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-manrope shadow-[0_4px_16px_rgba(16,26,92,0.08)]",
        VARIANT_STYLES[toast.variant],
      ].join(" ")}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Đóng thông báo"
        className="text-neutral-400 hover:text-neutral-600"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
