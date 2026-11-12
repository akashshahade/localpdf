import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-28 text-center">
        <p className="tabular text-[13px] font-medium text-primary">404</p>
        <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-ink">That page doesn&apos;t exist</h1>
        <p className="mt-2 text-[13.5px] text-muted-foreground">It may have been renamed. Browse all tools to find what you need.</p>
        <Link href="/#tools" className={buttonVariants({ variant: "ink", className: "mt-6" })}>
          Browse all tools
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
