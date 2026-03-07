import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://beelog-eight.vercel.app";

export const metadata: Metadata = {
  title: { default: "BEE log", template: "%s | BEE log" },
  description: "10代のための探究メディア",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "BEE log",
    title: "BEE log",
    description: "10代のための探究メディア",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "BEE log",
      },
    ],
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
      <body className="bg-[#FCBC2A] font-sans">
        {children}
      </body>
    </html>
  );
}