const CACHE_NAME = "calmnow-v5";

const RAW_PRECACHE = ["/", "/index.html", "/styles.css"];

function normalize(urlStr) {
  const base = self.registration.scope || self.location.origin;
  const url = new URL(urlStr, base);
  url.hash = "";
  if (url.pathname.slice(-1) === "/") url.pathname += "index.html";
  return url.toString();
}

const PRECACHE = (() => {
  const list = RAW_PRECACHE.map(normalize);
  return Array.from(new Set(list));
})();

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        await cache.addAll(PRECACHE);
      } catch {
        for (const u of PRECACHE) {
          try {
            await cache.add(u);
          } catch {}
        }
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
      );
      self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (
    url.pathname.startsWith("/@vite") ||
    url.pathname.startsWith("/__vite") ||
    url.pathname.includes("/node_modules/.vite/") ||
    url.pathname.endsWith(".hot-update.json") ||
    url.pathname.endsWith(".hot-update.js") ||
    url.pathname.endsWith("/sw.js")
  ) {
    return;
  }

  const bypassHosts = [
    "youtube.com",
    "www.youtube.com",
    "i.ytimg.com",
    "googleads.g.doubleclick.net",
    "pagead2.googlesyndication.com",
  ];
  if (url.origin !== self.location.origin) {
    if (
      bypassHosts.some(
        (h) => url.hostname === h || url.hostname.endsWith("." + h)
      )
    ) {
      return;
    }
  } else {
  }

  if (req.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      (async () => {
        try {
          const net = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, net.clone()).catch(() => {});
          return net;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          return (
            (await cache.match(req, { ignoreSearch: true })) ||
            (await cache.match("/index.html"))
          );
        }
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const net = await fetch(req);
        if (net && net.status === 200 && net.type === "basic") {
          cache.put(req, net.clone()).catch(() => {});
        }
        return net;
      } catch (e) {
        return cached || Promise.reject(e);
      }
    })()
  );
});
