import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "BEE log", template: "%s | BEE log" },
  description: "有意義な課外活動とコミュニティへの入口",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#FCBC2A] font-sans">
        {children}
      </body>
    </html>
  );
}