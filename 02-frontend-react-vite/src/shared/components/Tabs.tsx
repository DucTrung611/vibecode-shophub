export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={["flex items-center gap-2 border-b border-neutral-200", className ?? ""].join(" ")}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={[
              "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-bold font-manrope transition-colors",
              isActive
                ? "border-hub-500 text-hub-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700",
            ].join(" ")}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={[
                  "rounded-full px-1.5 py-0.5 text-xs font-bold",
                  isActive ? "bg-hub-50 text-hub-600" : "bg-neutral-100 text-neutral-500",
                ].join(" ")}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
