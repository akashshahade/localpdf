"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/overlays";
import { Kbd } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { categories, matchesTool, tools, type Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

export const OPEN_SEARCH_EVENT = "localpdf:open-search";

export function openToolSearch() {
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
    };
  }, []);

  const results = React.useMemo(() => (query ? tools.filter((t) => matchesTool(t, query)) : tools), [query]);
  const groups = categories
    .map((c) => ({ ...c, items: results.filter((t) => t.category === c.id) }))
    .filter((g) => g.items.length);
  const flat = groups.flatMap((g) => g.items);

  const go = (tool: Tool) => {
    setOpen(false);
    setQuery("");
    router.push(`/${tool.slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (active + (e.key === "ArrowDown" ? 1 : -1) + flat.length) % Math.max(flat.length, 1);
      setActive(next);
      listRef.current?.querySelector(`[data-index="${next}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      go(flat[active]);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setQuery("");
          setActive(0);
        }
      }}
    >
      <DialogContent onKeyDown={onKeyDown} aria-describedby="search-desc">
        <DialogTitle className="sr-only">Search tools</DialogTitle>
        <DialogDescription id="search-desc" className="sr-only">
          Type to filter, use arrow keys to move and Enter to open.
        </DialogDescription>
        <div className="flex items-center gap-2.5 border-b border-border px-4">
          <Search className="size-4 text-subtle" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search 50+ tools — merge, compress, sign…"
            className="h-12 flex-1 bg-transparent text-[14px] outline-none placeholder:text-subtle"
          />
          <Kbd>Esc</Kbd>
        </div>
        <div ref={listRef} className="max-h-[min(60vh,440px)] overflow-y-auto p-1.5">
          {flat.length === 0 && (
            <p className="px-3 py-10 text-center text-[13px] text-muted-foreground">
              No tool matches “{query}”. Try “merge”, “sign” or “word”.
            </p>
          )}
          {groups.map((g) => (
            <div key={g.id} className="pb-1">
              <p className="px-2.5 pt-2.5 pb-1 text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">{g.label}</p>
              {g.items.map((tool) => {
                const index = flat.indexOf(tool);
                const isActive = index === active;
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.slug}
                    data-index={index}
                    onMouseMove={() => setActive(index)}
                    onClick={() => go(tool)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left",
                      isActive && "bg-accent",
                    )}
                  >
                    <Icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium">{tool.name}</span>
                      <span className="block truncate text-[12px] text-muted-foreground">{tool.short}</span>
                    </span>
                    {tool.comingSoon ? <Badge variant="outline">Soon</Badge> : tool.badge && <Badge variant={tool.badge === "AI" ? "ink" : "default"}>{tool.badge}</Badge>}
                    {isActive && <ArrowRight className="size-3.5 text-muted-foreground" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="hidden items-center gap-4 border-t border-border bg-canvas px-4 py-2 text-[11.5px] text-muted-foreground can-hover:flex">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to move
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> to open
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
