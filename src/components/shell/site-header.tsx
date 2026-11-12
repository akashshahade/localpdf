"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/input";
import { openToolSearch } from "@/components/shell/command-palette";

const nav = [
  { href: "/#tools", label: "All tools" },
  { href: "/#how", label: "How it works" },
  { href: "/blog", label: "Blog" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-6 px-4 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={openToolSearch}
            className="hidden h-8 w-64 items-center gap-2 rounded-lg border border-input bg-background px-2.5 text-[13px] text-subtle shadow-xs transition-colors hover:border-[#d4d4d8] sm:flex"
          >
            <Search className="size-3.5" />
            <span className="flex-1 text-left">Search tools…</span>
            <Kbd>⌘K</Kbd>
          </button>
          <Button variant="ghost" size="icon-sm" className="sm:hidden" onClick={openToolSearch} aria-label="Search tools">
            <Search />
          </Button>
          <span className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[12px] font-medium text-muted-foreground lg:inline-flex">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            Runs on your device
          </span>
        </div>
      </div>
    </header>
  );
}
