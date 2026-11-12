import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function ToolCard({ tool, className }: { tool: Tool; className?: string }) {
  const Icon = tool.icon;
  const tag = tool.comingSoon ? <Badge variant="outline">Soon</Badge> : tool.badge ? <Badge variant={tool.badge === "AI" ? "ink" : "default"}>{tool.badge}</Badge> : null;
  return (
    <Link
      href={`/${tool.slug}`}
      className={cn(
        "group relative flex min-w-0 flex-row items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-xs transition-[border-color,box-shadow] duration-150 outline-none hover:border-[#dcdce0] hover:shadow-[0_4px_16px_-6px_rgba(18,18,20,0.08)] focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:flex-col sm:items-stretch sm:p-4",
        className,
      )}
    >
      <div className="flex shrink-0 items-start justify-between gap-2">
        <span className="grid size-9 place-items-center rounded-lg bg-secondary text-ink transition-colors group-hover:bg-primary-soft group-hover:text-primary">
          <Icon className="size-[18px]" strokeWidth={1.8} />
        </span>
        <span className="hidden sm:inline-flex">{tag}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-1.5 text-[14px] font-semibold">
          {tool.name}
          <span className="sm:hidden">{tag}</span>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[13px] leading-snug text-muted-foreground sm:mt-1 sm:line-clamp-2">{tool.short}</p>
      </div>
    </Link>
  );
}
