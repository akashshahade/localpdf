import type { Metadata } from "next";
import { CtaBand, Faq, Features, Hero, HowItWorks, faqs } from "@/components/home/sections";
import { ToolGrid } from "@/components/home/tool-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { liveTools } from "@/lib/tools";
import { absoluteUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${site.url}/#organization`,
            name: site.name,
            url: site.url,
            logo: absoluteUrl("/icon.svg"),
            description: site.description,
            email: site.contactEmail,
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${site.url}/#website`,
            name: site.name,
            url: site.url,
            description: site.description,
            inLanguage: "en",
            publisher: { "@id": `${site.url}/#organization` },
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${site.name} PDF tools`,
            numberOfItems: liveTools.length,
            itemListElement: liveTools.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: absoluteUrl(`/${t.slug}`) })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]}
      />
      <Hero />
      <section id="tools" className="mx-auto w-full max-w-[1240px] scroll-mt-20 px-4 pt-6 pb-12 md:px-8 md:py-16">
        <div className="mb-5 max-w-2xl md:mb-8">
          <p className="text-[11px] font-medium tracking-[0.08em] text-primary uppercase">All tools</p>
          <h2 className="mt-2 text-[24px] leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">
            One job per tool. Done in seconds.
          </h2>
        </div>
        <ToolGrid />
      </section>
      <HowItWorks />
      <Features />
      <Faq />
      <CtaBand />
    </>
  );
}
