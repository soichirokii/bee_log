import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        { key: "Surrogate-Control", value: "no-store" },
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