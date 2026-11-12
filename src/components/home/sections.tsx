import Link from "next/link";
import {
  ArrowRight,
  Check,
  CloudOff,
  BadgeCheck,
  Infinity as InfinityIcon,
  MonitorSmartphone,
  ShieldCheck,
  UserX,
  WifiOff,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Accordion, AccordionItem } from "@/components/ui/overlays";
import { HeroSearch, SearchCta } from "@/components/home/hero-search";
import { liveTools, tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function Hero() {
  const popular = tools.filter((t) => t.popular).slice(0, 8);
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="absolute top-[-180px] left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,69,0,0.16),transparent)]"
      />
      <div className="relative mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 pt-10 pb-6 text-center md:px-8 md:pt-24 md:pb-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[12px] font-medium text-muted-foreground shadow-xs">
          <span className="size-1.5 rounded-full bg-success" aria-hidden />
          Free forever · {liveTools.length} tools
        </span>
        <h1 className="mt-5 max-w-4xl text-[38px] leading-[1.05] font-semibold tracking-[-0.035em] text-ink sm:mt-6 sm:text-[60px] lg:text-[76px]">
          Free PDF tools.
          <br />
          <span className="text-subtle">Zero uploads.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-[16px]">
          Merge, edit, sign, compress and convert PDFs locally in your browser. Your files never leave your device —
          nothing to leak, nothing stored.
        </p>
        <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] font-medium text-foreground">
          {[
            { icon: CloudOff, label: "No upload" },
            { icon: UserX, label: "No sign-up" },
            { icon: WifiOff, label: "Works offline" },
            { icon: BadgeCheck, label: "No watermark" },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1.5">
              <Icon className="size-3.5 text-primary" />
              {label}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex w-full justify-center sm:mt-8">
          <HeroSearch />
        </div>
        <div className="mt-4 flex max-w-2xl flex-wrap justify-center gap-1.5">
          {popular.map((t) => (
            <Link
              key={t.slug}
              href={`/${t.slug}`}
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-[#d4d4d8] hover:text-foreground"
            >
              <t.icon className="size-3.5" />
              {t.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Features() {
  const promises = ["Nothing is uploaded", "Nothing is saved", "No account needed", "Close the tab and it’s gone"];
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 py-20 md:px-8">
      <div className="max-w-2xl">
        <p className="text-[11px] font-medium tracking-[0.08em] text-primary uppercase">Private by design</p>
        <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">
          Built so your documents can&apos;t leak.
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          Many PDF websites upload your contracts, IDs and bank statements to their servers. We don&apos;t — your files stay with you.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-6">
        <div className="rounded-2xl border border-border bg-background p-6 md:col-span-4 md:p-8">
          <span className="grid size-9 place-items-center rounded-lg bg-success-soft text-success">
            <ShieldCheck className="size-[18px]" />
          </span>
          <h3 className="mt-4 text-[18px] font-semibold tracking-[-0.02em]">Your files never leave your phone or computer</h3>
          <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
            Everything happens right here in your browser. Your documents are never sent to us or anyone else.
          </p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {promises.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[13.5px] font-medium">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <FeatureTile className="md:col-span-2" icon={WifiOff} title="Works offline" body="After your first visit, it keeps working without internet — on a plane or with Wi-Fi off." />
        <FeatureTile className="md:col-span-2" icon={InfinityIcon} title="No limits, no watermark" body="No daily caps, no file-size walls and no “upgrade to download”. Free means free." />
        <FeatureTile className="md:col-span-2" icon={Zap} title="Fast" body="No uploading and no waiting in a queue. Most files are done in seconds." />
        <FeatureTile className="md:col-span-2" icon={MonitorSmartphone} title="Any device" body="Works on phones, tablets and computers. Snap a document with your camera or sign with your finger." />
      </div>
    </section>
  );
}

function FeatureTile({
  icon: Icon,
  title,
  body,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-background p-6", className)}>
      <span className="grid size-9 place-items-center rounded-lg bg-secondary text-ink">
        <Icon className="size-[18px]" />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    { title: "Pick a tool", body: "Search or browse. Each tool does one job, clearly." },
    { title: "Drop your file", body: "It opens in this tab. Nothing is uploaded, ever." },
    { title: "Download", body: "Save the result, or hand it straight to the next tool." },
  ];
  return (
    <section id="how" className="scroll-mt-20 border-y border-border bg-canvas">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-20 md:px-8">
        <p className="text-[11px] font-medium tracking-[0.08em] text-primary uppercase">How it works</p>
        <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">Three steps. No account.</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="tabular grid size-8 place-items-center rounded-full bg-ink text-[13px] font-semibold text-white">
                  {i + 1}
                </span>
                {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-border md:block" aria-hidden />}
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{s.title}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export const faqs = [
  {
    q: "Are my files really not uploaded?",
    a: "Yes. The processing engines are downloaded to your browser and run there. Your document stays in this tab’s memory and is gone when you close it. You can verify this in your browser’s network panel.",
  },
  {
    q: "Is it free? What’s the catch?",
    a: "No catch. It’s free, with no watermark, no sign-up and no file limits. Because your files are processed on your own device, we don’t run servers that handle documents — so it costs very little to keep running.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. After your first visit the tools are saved in your browser, so they keep working without internet. You can also install it as an app from your browser menu or the Install app button.",
  },
  {
    q: "How big a file can I process?",
    a: "There’s no fixed limit — it depends on your device’s memory. Most laptops handle files of several hundred megabytes comfortably.",
  },
  {
    q: "Is it safe for Aadhaar, PAN or bank statements?",
    a: "That’s exactly what it’s built for. Nothing is sent anywhere, and the redaction tools remove the underlying text — not just cover it with a black box.",
  },
  {
    q: "Can I use it for work?",
    a: "Yes, including commercial use. Many teams use it precisely because client documents never leave the laptop.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto grid w-full max-w-[1240px] scroll-mt-20 gap-10 px-4 py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:px-8">
      <div>
        <p className="text-[11px] font-medium tracking-[0.08em] text-primary uppercase">FAQ</p>
        <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-ink sm:text-[32px]">Questions, answered.</h2>
        <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
          Still unsure? Every tool page explains exactly what happens to your file.
        </p>
      </div>
      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-background px-5">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`q${i}`} title={f.q}>
            {f.a}
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 pb-20 md:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-ink px-6 py-14 text-center sm:px-12">
        <div aria-hidden className="absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
        <div
          aria-hidden
          className="absolute -bottom-40 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,69,0,0.35),transparent)]"
        />
        <div className="relative">
          <Badge variant="ink" className="border border-white/15 bg-white/5 text-white/80">
            <ShieldCheck /> Private by default
          </Badge>
          <h2 className="mx-auto mt-4 max-w-xl text-[28px] leading-tight font-semibold tracking-[-0.03em] text-white sm:text-[40px]">
            Your files never leave this tab.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-white/60">
            No account, no upload, no watermark. Pick a tool and get it done.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <SearchCta />
            <Link
              href="/merge-pdf"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full border border-white/15 bg-white/5 px-5 text-white hover:bg-white/10",
              )}
            >
              Merge PDFs
              <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
