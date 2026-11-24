/*
 * Smoovy service worker.
 * - Pages: network first, fall back to the last cached copy, then to /offline.html.
 * - Static files (JS/CSS, images, icons): served from cache, refreshed in the background.
 * - Never caches API calls or anything from other sites (payments must always be live).
 * Bump VERSION to force every phone to drop old caches.
 */
const VERSION = "v2";
const PAGES = `smoovy-pages-${VERSION}`;
const ASSETS = `smoovy-assets-${VERSION}`;
const PRECACHE = ["/offline.html", "/smoovy/smoovy-logo.webp", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(ASSETS).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![PAGES, ASSETS].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/_next/image") ||
  url.pathname.startsWith("/brand/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.startsWith("/smoovy/") ||
  url.pathname.startsWith("/yanaya/");

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // map tiles, Paynow etc. go straight to the network
  if (url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match("/offline.html"))),
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
