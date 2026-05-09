/**
 * Minimal service worker for offline caching.
 * Caches core assets so the app loads even without network.
 */
const CACHE_NAME = 'tim-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/convert.js',
  '/js/ticker.js',
  '/js/particles.js',
  '/js/effects.js',
  '/js/share.js',
  '/js/app.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip CDN scripts (html2canvas) — let them load from network
  if (event.request.url.includes('cdn.jsdelivr.net')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Return cached, then update cache in background
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
