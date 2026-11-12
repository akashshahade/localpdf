export const site = {
  name: "LocalPDF",
  // Canonical URLs, sitemap, robots.txt and social cards use this. Override with NEXT_PUBLIC_SITE_URL for previews.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://editlocalpdf.com").replace(/\/$/, ""),
  wordmark: ["Local", "PDF"] as const,
  tagline: "Free PDF tools. Zero uploads.",
  description:
    "Free PDF tools that run entirely in your browser. No upload, no sign-up, no watermark — your files never leave your device.",
  year: 2026,
  legalUpdated: "11 November 2026",
  contactEmail: "hello@editlocalpdf.com",
};

export const legalPages = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms of use" },
  { href: "/security", label: "Security" },
] as const;

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
