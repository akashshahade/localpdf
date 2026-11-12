import type { Metadata } from "next";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { posts } from "@/lib/blog";
import { absoluteUrl, site } from "@/lib/site";

const title = "PDF Guides: Merge, Compress, Sign & Protect Files Privately";
const description =
  "Step-by-step PDF guides and privacy tips. Learn to merge, compress, sign, redact and convert PDFs for free — without uploading your files anywhere.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: { title, description, url: "/blog", type: "website" },
};

export default function BlogIndex() {
  const [featured, ...rest] = posts;
  return (
    <div className="bg-background">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${site.name} Guides`,
          description,
          url: absoluteUrl("/blog"),
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: absoluteUrl(`/blog/${p.slug}`),
            datePublished: p.published,
            dateModified: p.updated ?? p.published,
          })),
        }}
      />
      <div className="mx-auto w-full max-w-[1240px] px-4 py-14 md:px-8 md:py-20">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium tracking-[0.08em] text-primary uppercase">Blog</p>
          <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.035em] text-ink md:text-[48px]">
            PDF guides &amp; privacy tips
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Clear, step-by-step answers for everyday PDF jobs — and how to do them without handing your documents to a
            server.
          </p>
        </div>

        <PostCard post={featured} featured className="mt-10" />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
