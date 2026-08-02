import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,26,92,0.08)]"
      >
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="font-sora text-lg font-bold text-neutral-900">{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="ml-auto rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
