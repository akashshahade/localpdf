import type { Metadata } from "next";
import Link from "next/link";
import { CloudOff, Heart, ShieldCheck, WifiOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { liveTools } from "@/lib/tools";
import { absoluteUrl, site } from "@/lib/site";

const title = `About ${site.name} — Free, Private PDF Tools`;
const description = `${site.name} builds free PDF tools that run entirely in your browser, so your documents never leave your device. Here's why and how.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/about" },
  openGraph: { title, description, url: "/about" },
};

const principles = [
  { icon: CloudOff, title: "Your files stay yours", body: "Every tool runs on your device. We never receive, see or store your documents." },
  { icon: Heart, title: "Free, without catches", body: "No sign-up, no watermark, no daily limits and no “upgrade to download”." },
  { icon: WifiOff, title: "Works offline", body: "Once the page has loaded, the tools keep working without an internet connection." },
  { icon: ShieldCheck, title: "Honest about limits", body: "We tell you when to double-check a result — like OCR output or redactions." },
];

export default function AboutPage() {
  return (
    <div className="bg-canvas">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: title,
          description,
          url: absoluteUrl("/about"),
          mainEntity: {
            "@type": "Organization",
            name: site.name,
            url: site.url,
            logo: absoluteUrl("/icon.svg"),
            email: site.contactEmail,
            description: site.description,
          },
        }}
      />
      <div className="mx-auto w-full max-w-[880px] px-4 py-14 md:px-8 md:py-20">
        <p className="text-[11px] font-medium tracking-[0.08em] text-primary uppercase">About</p>
        <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-[-0.03em] text-ink md:text-[44px]">
          PDF tools that don&apos;t need your files.
        </h1>
        <div className="legal mt-6">
          <p>
            <strong>{site.name} is a free set of {liveTools.length} PDF tools that run entirely in your web browser.</strong>{" "}
            You can merge, split, compress, edit, sign, protect and convert PDFs without uploading them anywhere.
          </p>
          <h2>Why we built it</h2>
          <p>
            Most free PDF websites work by uploading your file to their servers. For a menu or a flyer, that&apos;s fine.
            For a passport scan, a salary slip or a client contract, it means trusting a stranger&apos;s server with
            something sensitive — usually without being able to check what happens to it.
          </p>
          <p>
            Modern browsers are powerful enough to do this work themselves. So instead of bringing your file to our
            server, we bring the PDF engine to your device. Nothing to upload means nothing to leak, retain or delete
            later.
          </p>
          <h2>How it works</h2>
          <ul>
            <li>When you open a tool, your browser downloads the app — just code, never your files.</li>
            <li>Your document is read from your device into the browser tab&apos;s memory and processed there.</li>
            <li>The result is saved straight back to your device. Close the tab and it&apos;s gone.</li>
          </ul>
          <p>
            You can verify this yourself: open your browser&apos;s Network panel while you use a tool, or turn off your
            internet after the page loads. Read more in our <Link href="/security">security overview</Link> and{" "}
            <Link href="/privacy">privacy policy</Link>.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {principles.map(({ icon: Icon, title: t, body }) => (
            <div key={t} className="rounded-2xl border border-border bg-background p-5">
              <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
                <Icon className="size-[18px]" />
              </span>
              <h2 className="mt-4 text-[15px] font-semibold">{t}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="legal mt-10">
          <h2>Who built it</h2>
          <p>
            {site.name} is an independent project. We don&apos;t publish personal profiles on this site.
          </p>
          <h2>Get in touch</h2>
          <p>
            Feedback, bug reports and ideas for new tools are welcome at{" "}
            <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/#tools" className={buttonVariants({ size: "lg" })}>
            Browse all tools
          </Link>
          <Link href="/blog" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Read the guides
          </Link>
        </div>
      </div>
    </div>
  );
}
