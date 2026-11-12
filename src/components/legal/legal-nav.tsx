"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { legalPages, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function LegalNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Legal" className="md:sticky md:top-20">
      <p className="px-2.5 pb-2 text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Legal</p>
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 scrollbar-none md:mx-0 md:flex-col md:px-0">
        {legalPages.map((p) => {
          const active = pathname === p.href;
          return (
            <li key={p.href} className="shrink-0">
              <Link
                href={p.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center rounded-lg px-2.5 text-[13.5px] font-medium transition-colors",
                  active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {p.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 hidden px-2.5 text-[12px] leading-relaxed text-muted-foreground md:block">
        Questions?{" "}
        <a href={`mailto:${site.contactEmail}`} className="font-medium text-foreground hover:underline">
          {site.contactEmail}
        </a>
      </p>
    </nav>
  );
}
