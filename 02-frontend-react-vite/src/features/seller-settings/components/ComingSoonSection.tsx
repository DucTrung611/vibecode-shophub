import { type FormEvent } from "react";
import { Info } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { notify } from "../../../shared/services/notify";

interface ComingSoonSectionProps {
  title: string;
  fields: { label: string; placeholder?: string }[];
}

/**
 * Renders form fields matching the design for a settings section that has no
 * backing endpoint yet (contact/address, shipping, payment, notifications).
 * Submitting shows an honest "coming soon" toast instead of silently doing
 * nothing or pretending to save — mirrors how the buyer app's ForgotPasswordForm
 * handles a similarly-deferred backend feature (UI present, no real submit).
 */
export function ComingSoonSection({ title, fields }: ComingSoonSectionProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    notify.info("Tính năng sắp ra mắt — chưa thể lưu thay đổi ở mục này.");
  };

  return (
    <form className="flex max-w-md flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="font-sora text-base font-extrabold text-neutral-900">{title}</h2>
      <div className="flex items-center gap-2 rounded-[10px] bg-info-tint px-3.5 py-2.5 text-xs font-bold font-manrope text-info">
        <Info size={15} />
        Tính năng sắp ra mắt — dữ liệu ở mục này chưa được lưu vào hệ thống.
      </div>

      {fields.map((field) => (
        <Input key={field.label} label={field.label} placeholder={field.placeholder} />
      ))}

      <div>
        <Button type="submit">Lưu thay đổi</Button>
      </div>
    </form>
  );
}
