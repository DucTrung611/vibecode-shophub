import { useEffect } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { type Toast, type ToastVariant, useToastStore } from "../services/notify";

const variantClasses: Record<ToastVariant, string> = {
  success: "border-success bg-success-tint text-success",
  error: "border-error bg-error-tint text-error",
  info: "border-info bg-info-tint text-info",
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div
      role="alert"
      className={[
        "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-bold font-manrope shadow-[0_4px_16px_rgba(16,26,92,0.08)]",
        variantClasses[toast.variant],
      ].join(" ")}
    >
      {variantIcons[toast.variant]}
      <span className="text-neutral-900">{toast.message}</span>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
