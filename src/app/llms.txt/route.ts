import { posts } from "@/lib/blog";
import { categories, tools } from "@/lib/tools";
import { absoluteUrl, site } from "@/lib/site";

/** llms.txt — a plain-text map of the site for AI assistants (https://llmstxt.org). */
export function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} is a free collection of ${tools.filter((t) => !t.comingSoon).length} PDF tools. Every tool runs entirely in the user's web browser using on-device processing, so files are never uploaded to a server. No account, no watermark, no file limits, and the tools work offline after the first visit.`,
    "",
    ...categories.flatMap((c) => [
      `## ${c.label}`,
      "",
      ...tools.filter((t) => t.category === c.id).map((t) => `- [${t.name}](${absoluteUrl(`/${t.slug}`)}): ${t.comingSoon ? "(Coming soon) " : ""}${t.short}`),
      "",
    ]),
    "## Guides",
    "",
    ...posts.map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.answer}`),
    "",
    "## About",
    "",
    `- [About ${site.name}](${absoluteUrl("/about")})`,
    `- [Privacy policy](${absoluteUrl("/privacy")})`,
    `- [Security](${absoluteUrl("/security")})`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
