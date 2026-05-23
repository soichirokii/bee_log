import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "./components/PageTransition";
import LinePopup from "./components/LinePopup";
import { Analytics } from "@vercel/analytics/react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.beelog-jp.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  manifest: "/manifest.json",
  title: {
    default: "BEE log | 10代のための探究メディア",
    template: "%s | BEE log",
  },
  description:
    "BEE logは、10代のための探究・課外活動メディアです。コンテスト、インターン、留学、イベントなどの挑戦の機会を見つけ、自分の興味や可能性を広げるきっかけを届けます。",
  verification: {
    google: "ZH1OcT_VNklTaZEHfcloZ-MN-K_RjwZ21yedcNFRoU4",
  },
  icons: {
    icon: [
      { url: "/beelog.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BEE log",
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "BEE log",
    title: "BEE log | 10代のための探究メディア",
    description:
      "10代のための探究・課外活動メディア。コンテスト、インターン、留学、イベントなど、興味を広げる挑戦の機会が見つかる。",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "BEE log",
      },
    ],
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "BEE log | 10代のための探究メディア",
    description:
      "10代のための探究・課外活動メディア。コンテスト、インターン、留学、イベントなどの挑戦の機会を届けます。",
    images: ["/ogp.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* フォント preconnect でDNSルックアップを先行処理 */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Noto Sans JP (全ページ) + Inter (Aboutページ用) を一括ロード */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&family=Noto+Sans+JP:wght@400;500;700;800;900&display=swap"
        />
        {/* Adobe Fonts（toppan-bunkyu） */}
        <link rel="stylesheet" href="https://use.typekit.net/qhn8cay.css" />
        <meta name="theme-color" content="#092040" />
      </head>
      <body className="bg-[#FFFFF0] font-sans">
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
        <PageTransition />
        {children}
        <LinePopup />
        <Analytics />
      </body>
    </html>
  );
}