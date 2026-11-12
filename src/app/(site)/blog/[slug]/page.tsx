import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Accordion, AccordionItem } from "@/components/ui/overlays";
import { buttonVariants } from "@/components/ui/button";
import { Markdown } from "@/components/blog/markdown";
import { PostCard } from "@/components/blog/post-card";
import { ReadingProgress, ScrollToTop, ShareButtons, TableOfContents } from "@/components/blog/post-chrome";
import { JsonLd } from "@/components/seo/json-ld";
import { LogoMark } from "@/components/brand/logo";
import { author, formatDate, getPost, getRelatedPosts, headings, posts, readingMinutes } from "@/lib/blog";
import { getTool } from "@/lib/tools";
import { absoluteUrl, site } from "@/lib/site";
import { cn } from "@/lib/utils";

// Every post is prerendered, so blocking on params is fine.
export const instant = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const url = `/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    authors: [{ name: author.name, url: author.url }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.published,
      modifiedTime: post.updated ?? post.published,
      authors: [author.name],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const url = absoluteUrl(`/blog/${post.slug}`);
  const toc = [...headings(post.body), { id: "faq", text: "Frequently asked questions" }];
  const tools = post.tools.map((s) => getTool(s)).filter((t) => t !== undefined);
  const related = getRelatedPosts(post);
  const modified = post.updated ?? post.published;

  return (
    <div className="bg-background">
      <ReadingProgress />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            abstract: post.answer,
            datePublished: post.published,
            dateModified: modified,
            mainEntityOfPage: url,
            url,
            image: absoluteUrl("/opengraph-image"),
            articleSection: post.category,
            author: { "@type": "Organization", name: author.name, url: absoluteUrl(author.url) },
            publisher: { "@type": "Organization", name: site.name, url: site.url, logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") } },
            speakable: { "@type": "SpeakableSpecification", cssSelector: ["#quick-answer"] },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: site.url },
              { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: post.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />

      <header className="mx-auto w-full max-w-[760px] px-4 pt-12 md:px-8 md:pt-16">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12.5px] text-muted-foreground">
          <Link href="/blog" className="hover:text-foreground">
            Blog
          </Link>
          <ChevronRight className="size-3.5 text-subtle" />
          <span className="text-primary">{post.category}</span>
        </nav>
        <h1 className="mt-5 text-[32px] leading-[1.12] font-semibold tracking-[-0.035em] text-ink md:text-[44px]">{post.title}</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{post.description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-y border-border py-4">
          <Link href={author.url} className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full">
              <LogoMark size={40} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-semibold">{author.name}</span>
              <span className="tabular block text-[12.5px] text-muted-foreground">
                Updated <time dateTime={modified}>{formatDate(modified)}</time> · {readingMinutes(post)} min read
              </span>
            </span>
          </Link>
          <ShareButtons url={url} title={post.title} />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1120px] gap-12 px-4 pt-10 pb-20 md:px-8 lg:grid-cols-[200px_minmax(0,680px)] lg:justify-center lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TableOfContents items={toc} />
          </div>
        </aside>

        <article className="article min-w-0">
          <section id="quick-answer" aria-label="Quick answer" className="rounded-2xl border border-border p-6">
            <p className="!mt-0 text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Quick answer</p>
            <p className="!mt-3 !text-[16px] !leading-[1.7] !text-ink">{post.answer}</p>
            {tools.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {tools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/${t.slug}`}
                    className="!no-underline inline-flex h-7 items-center gap-1.5 rounded-full border border-border px-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <t.icon className="size-3.5" />
                    {t.name}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <Markdown source={post.body} />

          <h2 id="faq">Frequently asked questions</h2>
          <Accordion type="multiple" className="mt-5 rounded-2xl border border-border px-5">
            {post.faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`f${i}`} title={f.q}>
                {f.a}
              </AccordionItem>
            ))}
          </Accordion>

          {tools[0] && (
            <div className="relative mt-12 overflow-hidden rounded-2xl bg-ink p-7 md:p-8">
              <div aria-hidden className="absolute -top-24 -right-24 size-64 rounded-full bg-[radial-gradient(closest-side,rgba(255,69,0,0.45),transparent)]" />
              <p className="relative !mt-0 text-[11px] font-medium tracking-[0.08em] !text-white/50 uppercase">Try it now</p>
              <p className="relative !mt-2 !text-[20px] !leading-snug font-semibold tracking-[-0.02em] !text-white">
                {tools[0].name} — right in your browser.
              </p>
              <p className="relative !mt-2 !text-[14px] !text-white/60">Free, no sign-up, and your file never leaves your device.</p>
              <div className="relative mt-5 flex flex-wrap gap-2">
                {tools.slice(0, 2).map((t, i) => (
                  <Link
                    key={t.slug}
                    href={`/${t.slug}`}
                    className={cn(
                      buttonVariants({ size: "lg", variant: i === 0 ? "default" : "ghost" }),
                      "rounded-full !no-underline",
                      i === 0 ? "!text-white" : "border border-white/15 !text-white hover:bg-white/10",
                    )}
                  >
                    {i === 0 ? `Open ${t.name}` : t.name}
                    <ArrowRight />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex gap-4 border-t border-border pt-8">
            <LogoMark size={44} />
            <div>
              <p className="!mt-0 !text-[14px] font-semibold !text-foreground">{author.name}</p>
              <p className="!mt-1 !text-[13.5px] !leading-relaxed !text-muted-foreground">{author.bio}</p>
            </div>
          </div>
        </article>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border" aria-labelledby="keep-reading">
          <div className="mx-auto w-full max-w-[1120px] px-4 py-16 md:px-8">
            <div className="flex items-baseline justify-between">
              <h2 id="keep-reading" className="text-[26px] font-semibold tracking-[-0.03em] text-ink">
                Keep reading
              </h2>
              <Link href="/blog" className="inline-flex items-center gap-1 text-[13px] font-medium hover:text-primary">
                All articles <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <ScrollToTop />
    </div>
  );
}
