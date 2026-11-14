import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { categories, tools } from "@/lib/tools";
import { legalPages, site } from "@/lib/site";

const footerGroups = categories.filter((c) => ["organize", "edit", "to-pdf", "from-pdf"].includes(c.id));

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-canvas">
      <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-4 py-12 md:grid-cols-[minmax(0,1.3fr)_repeat(5,minmax(0,1fr))] md:px-8">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{site.description}</p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-success">
            <ShieldCheck className="size-3.5" />
            Files are processed in your browser
          </p>
          <a
            href="https://www.producthunt.com/products/localpdf-8?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-localpdf-3a47a065-bb3e-48ef-8eac-64fc9b92e6a8"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- Product Hunt hosted badge SVG */}
            <img
              alt="LocalPDF - PDF tools that never upload your files | Product Hunt"
              width={250}
              height={54}
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1316277&theme=light"
            />
          </a>
        </div>
        {footerGroups.map((g) => (
          <div key={g.id}>
            <p className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">{g.label}</p>
            <ul className="mt-3 space-y-2">
              {tools
                .filter((t) => t.category === g.id)
                .slice(0, 5)
                .map((t) => (
                  <li key={t.slug}>
                    <Link href={`/${t.slug}`} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                      {t.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">Company</p>
          <ul className="mt-3 space-y-2">
            {[
              { href: "/about", label: "About" },
              { href: "/blog", label: "Blog" },
              { href: "/privacy", label: "Privacy" },
              { href: "/security", label: "Security" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-2 px-4 py-5 text-[12px] text-subtle sm:flex-row sm:items-center sm:justify-between md:px-8">
          <span>
            © {site.year} {site.name}. Free to use. Nothing uploaded, nothing stored.
          </span>
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            {legalPages.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
