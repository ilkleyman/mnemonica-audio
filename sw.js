const CACHE = 'mnemonica-v25';
const STATIC = [
  '/mnemonica-audio/',
  '/mnemonica-audio/index.html',
  '/mnemonica-audio/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Cache audio files from GitHub Pages
  if (url.hostname === 'ilkleyman.github.io' && url.pathname.includes('/audio/')) {
    e.respondWith(
      caches.open(CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        const response = await fetch(e.request);
        // Only cache full 200 OK responses. iOS Safari audio uses Range
        // requests that return 206 Partial Content, which cache.put rejects.
        // Wrap in try/catch so a cache failure never breaks the response.
        if (response.status === 200) {
          try { await cache.put(e.request, response.clone()); } catch(err) {}
        }
        return response;
      })
    );
    return;
  }
  // Network first for JSONBin API
  if (url.hostname.includes('jsonbin')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
