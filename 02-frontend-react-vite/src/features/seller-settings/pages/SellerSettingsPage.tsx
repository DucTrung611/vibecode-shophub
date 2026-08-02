import { useState } from "react";
import { Card } from "../../../shared/components/Card";
import { ShopContactSection } from "../components/ShopContactSection";
import { ShopInfoSection } from "../components/ShopInfoSection";
import { ShopNotificationsSection } from "../components/ShopNotificationsSection";
import { ShopPaymentSection } from "../components/ShopPaymentSection";
import { ShopShippingSection } from "../components/ShopShippingSection";

type SectionKey = "info" | "contact" | "shipping" | "payment" | "notifications";

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "info", label: "Thông tin shop" },
  { key: "contact", label: "Liên hệ & địa chỉ" },
  { key: "shipping", label: "Vận chuyển" },
  { key: "payment", label: "Thanh toán" },
  { key: "notifications", label: "Thông báo" },
];

export function SellerSettingsPage() {
  const [active, setActive] = useState<SectionKey>("info");

  return (
    <div className="flex gap-6">
      <Card padded={false} className="h-fit w-56 shrink-0 p-2">
        <nav className="flex flex-col gap-1">
          {SECTIONS.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActive(section.key)}
              className={[
                "rounded-[9px] px-3 py-2.5 text-left text-sm font-bold font-manrope transition-colors",
                active === section.key
                  ? "bg-hub-50 text-hub-600"
                  : "text-neutral-600 hover:bg-neutral-50",
              ].join(" ")}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </Card>

      <Card className="flex-1">
        {active === "info" && <ShopInfoSection />}
        {active === "contact" && <ShopContactSection />}
        {active === "shipping" && <ShopShippingSection />}
        {active === "payment" && <ShopPaymentSection />}
        {active === "notifications" && <ShopNotificationsSection />}
      </Card>
    </div>
  );
}
