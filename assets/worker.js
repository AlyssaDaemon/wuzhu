const cacheName = "TyrNetv1.1";

self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(cacheName)
    .then(c => {
      return c.addAll(urlsToCache);
    }));
});
self.addEventListener('fetch', evt => {
  evt.respondWith(caches.match(evt.request).then(res => {
    let url = new URL(evt.request.url)
    if (res || (!blacklist_domains.includes(url.host) && evt.request.method === "GET")) {
      fetch(evt.request).then( r => {
        caches.open(cacheName).then(cache => {
          cache.put(evt.request, r.clone());
        });
      });
    }
    return res || fetch(evt.request);
  }));
});

