// Offline support. Caches the app's own code and pages — never user files (those never leave memory).
const VERSION = "v1";
const STATIC = `static-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const CORE = ["/", "/manifest.webmanifest", "/icon.svg", "/icon-192.png", "/pdf.worker.min.mjs"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC && k !== PAGES).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isStatic = (url) => url.pathname.startsWith("/_next/static/") || /\.(?:mjs|js|css|woff2?|svg|png|ico|webmanifest)$/.test(url.pathname);

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(STATIC)).put(request, response.clone());
  return response;
}

async function networkFirst(request, fallback) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") (await caches.open(PAGES)).put(request, response.clone());
    return response;
  } catch {
    return (await caches.match(request, { ignoreVary: true })) ?? (fallback ? await caches.match(fallback) : undefined) ?? Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/_next/webpack-hmr")) return;
  if (isStatic(url)) event.respondWith(cacheFirst(request));
  else event.respondWith(networkFirst(request, request.mode === "navigate" ? "/" : undefined));
});
