import { useState } from "react";
import { Card } from "../../../shared/components/Card";
import { ComingSoonSection } from "../components/ComingSoonSection";
import { ShopInfoSection } from "../components/ShopInfoSection";

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
        {active === "contact" && (
          <ComingSoonSection
            title="Liên hệ & địa chỉ"
            fields={[
              { label: "Số điện thoại", placeholder: "0901234567" },
              { label: "Email liên hệ", placeholder: "shop@example.com" },
              { label: "Địa chỉ lấy hàng", placeholder: "Số nhà, đường, phường/xã" },
            ]}
          />
        )}
        {active === "shipping" && (
          <ComingSoonSection
            title="Vận chuyển"
            fields={[
              { label: "Đơn vị vận chuyển mặc định", placeholder: "GHN" },
              { label: "Phí vận chuyển cơ bản", placeholder: "20000" },
            ]}
          />
        )}
        {active === "payment" && (
          <ComingSoonSection
            title="Thanh toán"
            fields={[
              { label: "Số tài khoản ngân hàng", placeholder: "0123456789" },
              { label: "Tên ngân hàng", placeholder: "Vietcombank" },
            ]}
          />
        )}
        {active === "notifications" && (
          <ComingSoonSection
            title="Thông báo"
            fields={[
              { label: "Email nhận thông báo đơn hàng", placeholder: "shop@example.com" },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
