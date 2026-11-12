"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { ToolCard } from "@/components/tool/tool-card";
import { Input } from "@/components/ui/input";
import { categories, matchesTool, tools, type CategoryId } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function ToolGrid() {
  const [category, setCategory] = React.useState<CategoryId | "all">("all");
  const [query, setQuery] = React.useState("");

  const q = query.trim();
  const filtered = tools.filter((t) => (category === "all" || t.category === category) && (!q || matchesTool(t, q)));
  const groups = categories
    .filter((c) => category === "all" || c.id === category)
    .map((c) => ({ ...c, items: filtered.filter((t) => t.category === c.id) }))
    .filter((g) => g.items.length);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-none md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label="Tool categories">
          {[{ id: "all" as const, label: "All tools" }, ...categories].map((c) => {
            const active = category === c.id;
            const count = c.id === "all" ? tools.length : tools.filter((t) => t.category === c.id).length;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors",
                  active
                    ? "border-ink bg-ink text-ink-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-[#d4d4d8] hover:text-foreground",
                )}
              >
                {c.label}
                <span className={cn("tabular text-[11.5px]", active ? "text-white/60" : "text-subtle")}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative md:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-subtle" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter tools"
            aria-label="Filter tools"
            className="pl-8"
          />
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {groups.length === 0 && (
          <div className="rounded-xl border border-dashed border-border px-6 py-14 text-center">
            <p className="text-[14px] font-medium">No tools match “{query}”</p>
            <p className="mt-1 text-[13px] text-muted-foreground">Try a different word, or browse all categories.</p>
          </div>
        )}
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`cat-${g.id}`} className="animate-in fade-in-0">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h3 id={`cat-${g.id}`} className="text-[15px] font-semibold">
                {g.label}
              </h3>
              <p className="hidden text-[12.5px] text-muted-foreground sm:block">{g.blurb}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.items.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
