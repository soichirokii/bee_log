import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "./components/PageTransition";
import { Analytics } from "@vercel/analytics/react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.beelog-jp.com";
export const metadata: Metadata = {
  title: { default: "BEE log", template: "%s | BEE log" },
  description: "10代のための探究メディア",
  verification: {
    google: "ZH1OcT_VNklTaZEHfcloZ-MN-K_RjwZ21yedcNFRoU4",
  },
  icons: {
    icon: [
      { url: "/beelog.svg", type: "image/svg+xml" },
    ],
    shortcut: "/beelog.svg",
    apple: "/beelog.svg",
  },
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "BEE log",
    title: "BEE log",
    description: "10代のための探究メディア",
    images: [{ url: "/ogp.png", width: 1200, height: 630, alt: "BEE log" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BEE log",
    description: "10代のための探究メディア",
    images: ["/ogp.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#FFFFF0] font-sans">
        <PageTransition />
        {children}
        <Analytics />

      </body>
    </html>
  );
}