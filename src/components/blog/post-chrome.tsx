"use client";

import * as React from "react";
import { ArrowUp, Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ReadingProgress() {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]" aria-hidden>
      <div className="h-full origin-left bg-primary transition-transform duration-75" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

export function TableOfContents({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = React.useState(items[0]?.id);
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px" },
    );
    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page">
      <p className="text-[11px] font-medium tracking-[0.08em] text-subtle uppercase">On this page</p>
      <ul className="mt-4 border-l border-border">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className={cn(
                "-ml-px block border-l py-1.5 pl-3 text-[12.5px] leading-snug transition-colors",
                active === i.id ? "border-ink font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = React.useState(false);
  const btn =
    "grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-[#d4d4d8] hover:text-foreground";
  const enc = encodeURIComponent;
  return (
    <div className="flex items-center gap-1.5">
      <button
        className={btn}
        aria-label="Copy link"
        onClick={() => {
          navigator.clipboard?.writeText(url);
          setCopied(true);
          toast.success("Link copied");
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
      </button>
      <a className={btn} aria-label="Share on WhatsApp" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${enc(`${title} ${url}`)}`}>
        <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.43 9.88-9.88 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z" />
        </svg>
      </a>
      <a className={btn} aria-label="Share on X" target="_blank" rel="noopener noreferrer" href={`https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`}>
        <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a className={btn} aria-label="Share on LinkedIn" target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}>
        <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
        </svg>
      </a>
    </div>
  );
}

export function ScrollToTop() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed right-5 bottom-5 z-40 grid size-10 place-items-center rounded-full bg-ink text-white shadow-lg transition-[opacity,transform] duration-200 hover:bg-ink-hover",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}
