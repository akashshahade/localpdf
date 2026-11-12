"use client";

import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/input";
import { openToolSearch } from "@/components/shell/command-palette";

export function HeroSearch() {
  return (
    <button
      onClick={openToolSearch}
      className="group flex h-12 w-full max-w-xl items-center gap-3 rounded-xl border border-input bg-background px-4 text-left text-[14px] text-subtle shadow-sm transition-[border-color,box-shadow] hover:border-[#d4d4d8] hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-primary/25 focus-visible:outline-none"
    >
      <Search className="size-4 text-muted-foreground" />
      <span className="flex-1 truncate">
        <span className="sm:hidden">Search PDF tools…</span>
        <span className="hidden sm:inline">What do you need to do with your PDF?</span>
      </span>
      <Kbd>⌘K</Kbd>
    </button>
  );
}

export function SearchCta() {
  return (
    <Button variant="default" size="lg" onClick={openToolSearch} className="rounded-full px-5">
      Find a tool
      <ArrowRight />
    </Button>
  );
}
