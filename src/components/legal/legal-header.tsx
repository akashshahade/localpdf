import type { LucideIcon } from "lucide-react";
import { site } from "@/lib/site";

export function LegalHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="border-b border-border pb-8">
      <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-ink md:text-[32px]">{title}</h1>
      <p className="mt-2 text-[12.5px] text-subtle">Last updated {site.legalUpdated}</p>
      <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{lead}</p>
    </header>
  );
}

export function LegalSummary({ items }: { items: { icon: LucideIcon; title: string; body: string }[] }) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-3">
      {items.map(({ icon: Icon, title, body }) => (
        <div key={title} className="rounded-xl border border-border bg-background p-4">
          <span className="grid size-8 place-items-center rounded-lg bg-success-soft text-success">
            <Icon className="size-4" />
          </span>
          <p className="mt-3 text-[13.5px] font-semibold">{title}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{body}</p>
        </div>
      ))}
    </div>
  );
}
