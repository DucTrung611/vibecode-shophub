import type { HTMLAttributes } from "react";

export type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  error: "bg-error-tint text-error",
  info: "bg-info-tint text-info",
  neutral: "bg-neutral-100 text-neutral-600",
};

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold font-manrope",
        variantClasses[variant],
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}
