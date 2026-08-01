import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { QueryProvider } from "@/shared/providers/query-provider";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ShopHub",
  description: "Nền tảng thương mại đa gian hàng đáng tin cậy dành cho bạn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${sora.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-manrope">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
