import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-bold font-manrope text-neutral-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={[
            "rounded-[9px] border px-3.5 py-3 text-sm font-manrope text-neutral-900 outline-none transition-colors",
            "placeholder:text-neutral-400",
            error
              ? "border-error focus:border-error"
              : "border-neutral-200 focus:border-hub-500 focus:ring-3 focus:ring-hub-100",
            className ?? "",
          ].join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
