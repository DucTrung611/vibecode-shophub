import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ padded = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-neutral-200 bg-white shadow-[0_4px_16px_rgba(16,26,92,0.08)]",
        padded ? "p-5" : "",
        className ?? "",
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
