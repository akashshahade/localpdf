"use client";

import * as React from "react";
import { toast } from "sonner";
import { tools } from "@/lib/tools";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let deferred: InstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  // Must be captured before React mounts, or Chrome's one-time event is missed.
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    toast.success("App installed", { description: "Open it from your home screen or app list. It works offline." });
  });
}

const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;

export async function installApp() {
  if (isStandalone()) {
    toast("Already installed", { description: "You're using the installed app." });
    return;
  }
  if (deferred) {
    const prompt = deferred;
    deferred = null;
    await prompt.prompt();
    return;
  }
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    toast("Install on iPhone or iPad", { description: "Tap the Share button in Safari, then “Add to Home Screen”." });
    return;
  }
  toast("Install from your browser menu", { description: "Look for “Install app” or “Add to Home screen” in the browser menu." });
}

const WARMED = "lp-offline-warmed";
const WEEK = 7 * 24 * 60 * 60 * 1000;

/** Fetch every tool page, its scripts and the PDF engines once, so the service worker can serve them offline. */
async function warmOfflineCache() {
  const pages = ["/", ...tools.filter((t) => !t.comingSoon).map((t) => `/${t.slug}`)];
  const assets = new Set<string>();
  for (const path of pages) {
    const html = await fetch(path).then((r) => (r.ok ? r.text() : ""), () => "");
    for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) assets.add(m[0]);
  }
  await Promise.allSettled([...assets].map((a) => fetch(a)));
  const { pdfjs } = await import("@/lib/pdf/pdfjs");
  await Promise.allSettled([
    pdfjs(),
    import("@/lib/pdf/processors"),
    import("@/lib/pdf/handoff"),
    import("@cantoo/pdf-lib"),
    import("mammoth"),
    import("docx"),
  ]);
  localStorage.setItem(WARMED, String(Date.now()));
}

export function ServiceWorkerRegistration() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        if (Date.now() - Number(localStorage.getItem(WARMED) ?? 0) < WEEK) return;
        const run = () => void warmOfflineCache().catch(() => {});
        if ("requestIdleCallback" in window) requestIdleCallback(run, { timeout: 10_000 });
        else setTimeout(run, 3000);
      })
      .catch(() => {});
  }, []);
  return null;
}
