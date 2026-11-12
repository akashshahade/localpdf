"use client";

import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="grid min-h-dvh place-items-center bg-canvas px-4 text-center font-sans">
        <main className="max-w-md">
          <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-ink">Something went wrong</h1>
          <p className="mt-2 text-[13.5px] text-muted-foreground">Your files were never uploaded, so nothing was lost or shared.</p>
          <button onClick={reset} className="mt-6 h-10 rounded-lg bg-primary px-4 text-[13px] font-medium text-white">
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
