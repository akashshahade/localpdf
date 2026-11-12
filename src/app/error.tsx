"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-[13px] font-medium text-primary">Something went wrong</p>
      <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-ink">This page hit a snag</h1>
      <p className="mt-2 text-[13.5px] text-muted-foreground">
        Your files were never uploaded, so nothing was lost or shared. Try again, or reload the page.
      </p>
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Go home
        </Link>
      </div>
    </main>
  );
}
