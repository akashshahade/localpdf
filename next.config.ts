import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// PDF engines stay first-party. Analytics/GTM are the only third-party origins.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://cloud.umami.is",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.google.co.in",
  "font-src 'self' data:",
  "connect-src 'self' blob: data: https://www.google-analytics.com https://www.analytics.google.com https://region1.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.googletagmanager.com https://vitals.vercel-insights.com https://va.vercel-scripts.com https://cloud.umami.is https://api-gateway.umami.dev",
  "worker-src 'self' blob:",
  "frame-src https://www.googletagmanager.com",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
    ];
  },
  async redirects() {
    return [
      { source: "/licenses", destination: "/terms", permanent: true },
      { source: "/blog/ocr-scanned-pdf-searchable", destination: "/blog", permanent: true },
      { source: "/blog/reduce-pdf-size-for-online-forms", destination: "/blog/compress-pdf-to-100kb-200kb-500kb", permanent: true },
      { source: "/blog/mask-aadhaar-pan-in-pdf", destination: "/blog/mask-aadhaar-number-pdf", permanent: true },
    ];
  },
};

export default nextConfig;
