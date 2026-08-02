import type { ReactNode } from "react";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaColor?: string;
  icon: ReactNode;
  iconBg?: string;
}

export function StatCard({ label, value, delta, deltaColor, icon, iconBg }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold font-manrope text-neutral-500">{label}</span>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-[9px]"
          style={{ backgroundColor: iconBg ?? "#EEF1FF" }}
        >
          {icon}
        </div>
      </div>
      <div className="mt-2.5 font-sora text-2xl font-extrabold text-neutral-900">{value}</div>
      {delta && (
        <div className="mt-1.5 text-xs font-bold font-manrope" style={{ color: deltaColor ?? "#1A9E5C" }}>
          {delta}
        </div>
      )}
    </Card>
  );
}
