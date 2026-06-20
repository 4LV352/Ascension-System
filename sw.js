const CACHE_NAME = "ascension-system-v17";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./manifest.webmanifest",
  "./icons/favicon-32.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon.svg",
  "./icons/maskable.svg",
  "./icons/mark-transparent.svg",
  "./icons/mark-transparent.png",
  "./icons/mark-transparent-192.png",
  "./icons/splash.svg",
  "./icons/splash.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      const client = clients.find(item => item.url.includes("index.html") || item.url.endsWith("/"));
      if (client) return client.focus();
      return self.clients.openWindow("./index.html");
    })
  );
});
