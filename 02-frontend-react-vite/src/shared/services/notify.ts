import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, variant: ToastVariant) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (message, variant) =>
    set((state) => ({
      toasts: [...state.toasts, { id: nextId++, message, variant }],
    })),
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));

export const notify = {
  success: (message: string) => useToastStore.getState().push(message, "success"),
  error: (message: string) => useToastStore.getState().push(message, "error"),
  info: (message: string) => useToastStore.getState().push(message, "info"),
};

export function useNotify() {
  return notify;
}
