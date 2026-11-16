// Next.js ayar dosyası
import type { NextConfig } from "next";

// Backend ayrı bir uygulama. Tarayıcı /api/... isteklerini frontend'e gönderir,
// Next.js bunları arka planda backend'e iletir (proxy). Böylece:
//  - oturum çerezi frontend'in kendi adresinde tutulur (farklı alan adlarında da çalışır),
//  - CORS ayarına gerek kalmaz.
const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:3000").replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
      // Backend'e yüklenen görseller (yerel geliştirme)
      { source: "/uploads/:path*", destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
