import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="flex items-start gap-2 text-xs font-manrope text-neutral-700">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className={[
              "mt-0.5 h-4 w-4 rounded border-neutral-300 text-hub-500 focus:ring-hub-200",
              className ?? "",
            ].join(" ")}
            {...props}
          />
          <span>{label}</span>
        </label>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
