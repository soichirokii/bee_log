import type { NextConfig } from "next";

const ContentSecurityPolicy = [
  "default-src 'self'",
  // インラインスクリプト（SW登録）と Vercel Analytics を許可
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  // Typekit・Google Fonts のスタイル許可（インライン style は Next.js が生成）
  "style-src 'self' 'unsafe-inline' https://use.typekit.net https://fonts.googleapis.com",
  // フォントファイル
  "font-src 'self' https://use.typekit.net https://fonts.gstatic.com",
  // 画像：Notion S3・Imgur・OGP 等
  [
    "img-src 'self' data: blob:",
    "https://i.imgur.com",
    "https://*.notion.so",
    "https://*.amazonaws.com",
    "https://prod-files-secure.s3.us-west-2.amazonaws.com",
  ].join(" "),
  // Vercel Analytics の送信先
  "connect-src 'self' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  // Service Worker
  "worker-src 'self'",
  // frame-ancestors は X-Frame-Options: DENY と同等
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: ContentSecurityPolicy },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.notion.so" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "prod-files-secure.s3.us-west-2.amazonaws.com" },
      { protocol: "https", hostname: "i.imgur.com" },
    ],
  },
};

export default nextConfig;
