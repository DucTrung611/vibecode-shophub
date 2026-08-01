import { StorefrontLayout } from "@/shared/components/layout/StorefrontLayout";

export default function StorefrontRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}
