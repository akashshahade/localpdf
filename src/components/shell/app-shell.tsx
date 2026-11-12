"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  Download,
  LayoutGrid,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/controls";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTitle, SheetContent } from "@/components/ui/overlays";
import { openToolSearch } from "@/components/shell/command-palette";
import { installApp } from "@/components/pwa";
import { categories, getCategory, getTool, tools, type CategoryId } from "@/lib/tools";
import { legalPages, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeSlug = pathname.split("/")[1] ?? "";
  const activeTool = getTool(activeSlug);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [toggled, setToggled] = React.useState<Partial<Record<CategoryId, boolean>>>({});

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isOpen = (id: CategoryId) => toggled[id] ?? id === activeTool?.category;
  const toggleCategory = (id: CategoryId) => setToggled((t) => ({ ...t, [id]: !isOpen(id) }));
  const expandTo = (id: CategoryId) => {
    setCollapsed(false);
    setToggled((t) => ({ ...t, [id]: true }));
  };

  const sidebarProps = { activeSlug, isOpen, toggleCategory };

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside
        className={cn(
          "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200 ease-out lg:flex",
          collapsed ? "w-16" : "w-[248px]",
        )}
        aria-label="Tools"
      >
        {collapsed ? (
          <CollapsedRail activeCategory={activeTool?.category} onExpand={() => setCollapsed(false)} onCategory={expandTo} />
        ) : (
          <SidebarBody {...sidebarProps} onCollapse={() => setCollapsed(true)} />
        )}
      </aside>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent aria-describedby={undefined}>
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <SidebarBody {...sidebarProps} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur-md md:px-6">
          <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <Menu />
          </Button>
          <LogoMark size={24} className="lg:hidden" />
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-[13px]">
            <Link href="/#tools" className="hidden text-muted-foreground hover:text-foreground sm:inline">
              All tools
            </Link>
            {activeTool && (
              <>
                <ChevronRight className="hidden size-3.5 shrink-0 text-subtle sm:block" />
                <span className="hidden text-muted-foreground md:inline">{getCategory(activeTool.category).label}</span>
                <ChevronRight className="hidden size-3.5 shrink-0 text-subtle md:block" />
                <span className="truncate font-medium text-foreground">{activeTool.name}</span>
              </>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={openToolSearch}
              className="hidden h-8 w-56 items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-[13px] text-subtle shadow-xs transition-colors hover:border-[#d4d4d8] md:flex"
            >
              <Search className="size-3.5" />
              <span className="flex-1 text-left">Search tools…</span>
              <Kbd>⌘K</Kbd>
            </button>
            <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={openToolSearch} aria-label="Search tools">
              <Search />
            </Button>
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[12px] font-medium text-muted-foreground xl:inline-flex">
              <span className="size-1.5 rounded-full bg-success" aria-hidden />
              Runs on your device
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border bg-background px-4 py-4 md:px-6">
          <div className="flex flex-col gap-2 text-[12px] text-subtle sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {site.year} {site.name} · Free to use · Nothing is uploaded or stored
            </span>
            <span className="flex flex-wrap gap-x-4 gap-y-1">
              {legalPages.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-foreground">
                  {l.label}
                </Link>
              ))}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarBody({
  activeSlug,
  isOpen,
  toggleCategory,
  onCollapse,
  onNavigate,
}: {
  activeSlug: string;
  isOpen: (id: CategoryId) => boolean;
  toggleCategory: (id: CategoryId) => void;
  onCollapse?: () => void;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
        <Logo />
        {onCollapse && (
          <Tooltip content={<span>Collapse <span className="opacity-60">Ctrl B</span></span>} side="right">
            <Button variant="ghost" size="icon-xs" onClick={onCollapse} aria-label="Collapse sidebar" className="text-muted-foreground">
              <PanelLeftClose />
            </Button>
          </Tooltip>
        )}
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={() => {
            onNavigate?.();
            openToolSearch();
          }}
          className="flex h-8 w-full items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-[13px] text-subtle shadow-xs transition-colors hover:border-[#d4d4d8]"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search tools</span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3" aria-label="Tool categories">
        <NavRow href="/#tools" icon={LayoutGrid} label="All tools" onNavigate={onNavigate} />
        <p className="px-2 pt-4 pb-1.5 text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Tools</p>
        <ul className="space-y-0.5">
          {categories.map((c) => {
            const open = isOpen(c.id);
            const items = tools.filter((t) => t.category === c.id);
            return (
              <li key={c.id}>
                <button
                  onClick={() => toggleCategory(c.id)}
                  aria-expanded={open}
                  className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-[13.5px] font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <span className="flex-1 truncate text-left">{c.label}</span>
                  <span className="tabular text-[11.5px] text-subtle">{items.length}</span>
                  <ChevronRight className={cn("size-3.5 text-subtle transition-transform duration-200", open && "rotate-90")} />
                </button>
                {open && (
                  <ul className="mt-0.5 mb-1.5 space-y-0.5 animate-in fade-in-0 slide-in-from-top-1">
                    {items.map((t) => {
                      const active = t.slug === activeSlug;
                      return (
                        <li key={t.slug}>
                          <Link
                            href={`/${t.slug}`}
                            onClick={onNavigate}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "group flex h-8 items-center gap-2.5 rounded-lg pr-2 pl-3 text-[13px] transition-colors",
                              active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                          >
                            <t.icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-[#8b8b93] group-hover:text-foreground")} strokeWidth={1.75} />
                            <span className="flex-1 truncate">{t.name}</span>
                            {t.comingSoon ? <Badge variant="outline" className="px-1 text-[10px]">Soon</Badge> : t.badge && <Badge variant={t.badge === "AI" ? "ink" : "default"} className="px-1 text-[10px]">{t.badge}</Badge>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 space-y-2 border-t border-border p-3">
        <div className="rounded-xl border border-border bg-canvas p-3">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium">
            <ShieldCheck className="size-3.5 text-success" />
            Running locally
          </p>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            Files stay in this tab. Nothing is uploaded or saved.
          </p>
        </div>
        <div className="space-y-0.5">
          <NavRow href="/blog" icon={BookOpen} label="Blog" onNavigate={onNavigate} />
          <NavRow icon={Download} label="Install app" onClick={() => void installApp()} />
        </div>
      </div>
    </>
  );
}

function NavRow({
  href,
  icon: Icon,
  label,
  onClick,
  onNavigate,
}: {
  href?: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  onNavigate?: () => void;
}) {
  const cls =
    "flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
  const inner = (
    <>
      <Icon className="size-[17px] text-[#8b8b93]" strokeWidth={1.75} />
      {label}
    </>
  );
  return href ? (
    <Link href={href} onClick={onNavigate} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function CollapsedRail({
  activeCategory,
  onExpand,
  onCategory,
}: {
  activeCategory?: CategoryId;
  onExpand: () => void;
  onCategory: (id: CategoryId) => void;
}) {
  const railBtn = "grid size-10 place-items-center rounded-lg text-[#8b8b93] transition-colors hover:bg-accent hover:text-foreground";
  return (
    <div className="flex h-full flex-col items-center gap-1 py-3">
      <Link href="/" aria-label={`${site.name} home`} className="mb-1">
        <LogoMark size={28} />
      </Link>
      <Tooltip content={<span>Expand <span className="opacity-60">Ctrl B</span></span>} side="right">
        <button onClick={onExpand} className={railBtn} aria-label="Expand sidebar">
          <PanelLeftOpen className="size-[17px]" />
        </button>
      </Tooltip>
      <Tooltip content="Search tools" side="right">
        <button onClick={openToolSearch} className={railBtn} aria-label="Search tools">
          <Search className="size-[17px]" />
        </button>
      </Tooltip>
      <span className="my-2 h-px w-8 bg-border" aria-hidden />
      {categories.map((c) => (
        <Tooltip key={c.id} content={c.label} side="right">
          <button
            onClick={() => onCategory(c.id)}
            aria-label={c.label}
            className={cn(railBtn, "relative", c.id === activeCategory && "bg-accent text-primary")}
          >
            <c.icon className="size-[17px]" strokeWidth={1.75} />
          </button>
        </Tooltip>
      ))}
      <div className="mt-auto flex flex-col items-center gap-1">
        <Tooltip content="Install app" side="right">
          <button onClick={() => void installApp()} className={railBtn} aria-label="Install app">
            <Download className="size-[17px]" />
          </button>
        </Tooltip>
        <Tooltip content="Running locally — nothing is uploaded" side="right">
          <span className="grid size-10 place-items-center" aria-label="Running locally">
            <span className="size-2 rounded-full bg-success" />
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
