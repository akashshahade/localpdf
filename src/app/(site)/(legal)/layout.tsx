import { LegalNav } from "@/components/legal/legal-nav";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-canvas">
      <div className="mx-auto grid w-full max-w-[1080px] gap-8 px-4 py-10 md:grid-cols-[200px_minmax(0,1fr)] md:gap-12 md:px-8 md:py-14">
        <LegalNav />
        <article className="min-w-0 rounded-2xl border border-border bg-background px-5 py-8 shadow-xs sm:px-10 sm:py-10">
          {children}
        </article>
      </div>
    </div>
  );
}
