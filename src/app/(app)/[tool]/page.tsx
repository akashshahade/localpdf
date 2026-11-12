import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CloudOff, Lock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem } from "@/components/ui/overlays";
import { ToolCard } from "@/components/tool/tool-card";
import { ToolWorkspace } from "@/components/tool/tool-workspace";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategory, getRelated, getTool, tools } from "@/lib/tools";
import { toolAnswer, toolDescription, toolFaqs, toolSteps, toolTitle } from "@/lib/tool-seo";
import { postsForTool } from "@/lib/blog";
import { absoluteUrl, site } from "@/lib/site";
import { cn } from "@/lib/utils";

// All tool slugs are prerendered, so blocking on params is fine.
export const instant = false;

export function generateStaticParams() {
  return tools.map((t) => ({ tool: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[tool]">): Promise<Metadata> {
  const tool = getTool((await params).tool);
  if (!tool) return {};
  const title = toolTitle(tool);
  const description = toolDescription(tool);
  return {
    title,
    description,
    keywords: [tool.name, `${tool.name} online`, `${tool.name} free`, `${tool.name} no upload`, ...(tool.keywords?.split(" ") ?? [])],
    alternates: { canonical: `/${tool.slug}` },
    openGraph: { title, description, url: `/${tool.slug}` },
    twitter: { title, description },
    ...(tool.comingSoon && { robots: { index: false, follow: true } }),
  };
}

export default async function ToolPage({ params }: PageProps<"/[tool]">) {
  const tool = getTool((await params).tool);
  if (!tool) notFound();

  const category = getCategory(tool.category);
  const related = getRelated(tool);
  const steps = toolSteps(tool);
  const faqs = toolFaqs(tool);
  const guides = postsForTool(tool.slug);
  const url = absoluteUrl(`/${tool.slug}`);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "All tools", item: site.url },
      { "@type": "ListItem", position: 2, name: category.label, item: `${site.url}/#tools` },
      { "@type": "ListItem", position: 3, name: tool.name, item: url },
    ],
  };

  return (
    <div>
      <JsonLd
        data={
          tool.comingSoon
            ? [breadcrumb]
            : [
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: `${site.name} ${tool.name}`,
            url,
            description: toolDescription(tool),
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any (runs in a web browser)",
            browserRequirements: "Requires JavaScript and a modern browser",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            publisher: { "@type": "Organization", name: site.name, url: site.url },
          },
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to use ${tool.name}`,
            description: toolAnswer(tool),
            totalTime: "PT1M",
            tool: { "@type": "HowToTool", name: `${site.name} ${tool.name}` },
            step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body, url: `${url}#how-to` })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
          breadcrumb,
        ]
        }
      />
      <div className="mx-auto w-full max-w-[1240px] px-4 py-4 md:px-8 md:py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-3 md:gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background text-primary shadow-xs md:size-12">
              <tool.icon className="size-5 md:size-[22px]" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] font-semibold tracking-[-0.028em] text-ink md:text-[26px]">{tool.name}</h1>
                {tool.badge && <Badge variant={tool.badge === "AI" ? "ink" : "default"}>{tool.badge}</Badge>}
              </div>
              <p className="mt-0.5 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground md:mt-1 md:line-clamp-none md:text-[13.5px]">{tool.description}</p>
            </div>
          </div>
          <div className="hidden flex-wrap gap-1.5 md:flex">
            <Badge variant="success">
              <CloudOff /> No upload
            </Badge>
            <Badge variant="secondary">No sign-up</Badge>
            <Badge variant="secondary">No watermark</Badge>
          </div>
        </header>

        <div className="mt-4 md:mt-6">
          <ToolWorkspace key={tool.slug} slug={tool.slug} />
        </div>
      </div>

      <div className="border-t border-border bg-background">
        {!tool.comingSoon && (
        <>
        <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-4 py-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section aria-labelledby="how-to-title" id="how-to" className="scroll-mt-20">
            <h2 id="how-to-title" className="text-[21px] font-semibold tracking-[-0.025em] text-ink">
              How do I {tool.name.toLowerCase().startsWith("why") ? "find out why my PDF is big" : `use ${tool.name}`} without uploading?
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[#3f3f46]">{toolAnswer(tool)}</p>
            <ol className="mt-6 space-y-5">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="tabular grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white">{i + 1}</span>
                  <div>
                    <h3 className="text-[14px] font-semibold">{s.title}</h3>
                    <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <aside className="rounded-2xl border border-border bg-canvas p-5">
            <span className="grid size-9 place-items-center rounded-lg bg-success-soft text-success">
              <ShieldCheck className="size-[18px]" />
            </span>
            <h2 className="mt-4 text-[15px] font-semibold">What happens to your file?</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Nothing leaves your device. The {tool.name.toLowerCase()} engine runs inside this browser tab and your file is cleared from memory when you close it.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
              <Lock className="size-3" /> Works offline after first visit
            </p>
          </aside>
        </div>

        <section className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 pb-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]" aria-labelledby="faq">
          <div>
            <h2 id="faq" className="text-[21px] font-semibold tracking-[-0.025em] text-ink">
              {tool.name} FAQ
            </h2>
            <Accordion type="single" collapsible className="mt-4 rounded-2xl border border-border bg-background px-5">
              {faqs.map((f, i) => (
                <AccordionItem key={f.q} value={`f${i}`} title={f.q}>
                  {f.a}
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          {guides.length > 0 && (
            <div>
              <h2 className="text-[15px] font-semibold">Guides</h2>
              <div className="mt-4 space-y-3">
                {guides.map((p) => (
                  <PostCard key={p.slug} post={p} />
                ))}
              </div>
            </div>
          )}
        </section>
        </>
        )}

        {related.length > 0 && (
          <section className={cn("mx-auto w-full max-w-[1240px] px-4 pb-16 md:px-8", tool.comingSoon && "pt-14")} aria-labelledby="related">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="related" className="text-[15px] font-semibold">
                More {category.label.replace(/^\w/, (c) => c.toLowerCase()).replace(/\bai\b|\bocr\b/gi, (m) => m.toUpperCase())} tools
              </h2>
              <Link href="/#tools" className="text-[13px] font-medium text-primary hover:underline">
                See all tools
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
