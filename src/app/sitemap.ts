import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { tools } from "@/lib/tools";
import { absoluteUrl, legalPages } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = posts[0]?.updated ?? posts[0]?.published;
  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    ...tools.filter((t) => !t.comingSoon).map((t) => ({
      url: absoluteUrl(`/${t.slug}`),
      changeFrequency: "monthly" as const,
      priority: t.popular ? 0.9 : 0.8,
    })),
    { url: absoluteUrl("/blog"), lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updated ?? p.published,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
    ...legalPages.map((l) => ({ url: absoluteUrl(l.href), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
