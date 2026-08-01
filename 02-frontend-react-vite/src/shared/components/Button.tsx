import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-hub-500 text-white hover:bg-hub-600 disabled:bg-neutral-100 disabled:text-neutral-400",
  outline:
    "bg-white text-hub-600 border border-hub-500 hover:bg-hub-50 disabled:border-neutral-200 disabled:text-neutral-400",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", isLoading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          "w-full rounded-[10px] px-[22px] py-3 text-sm font-bold font-manrope transition-colors disabled:cursor-not-allowed",
          variantClasses[variant],
          className ?? "",
        ].join(" ")}
        {...props}
      >
        {isLoading ? "Đang xử lý..." : children}
      </button>
    );
  },
);

Button.displayName = "Button";
