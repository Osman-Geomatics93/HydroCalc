const CACHE_NAME = 'hydro-calc-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/offline.html',
];

// All app route paths to precache for offline navigation
const APP_ROUTES = [
  '/ch1/geometry', '/ch1/froude',
  '/ch2/energy', '/ch2/critical-depth', '/ch2/alternate-depths', '/ch2/obstructions',
  '/ch3/momentum', '/ch3/hydraulic-jump', '/ch3/combined',
  '/ch4/manning', '/ch4/normal-depth', '/ch4/classification',
  '/ch5/taxonomy', '/ch5/composite',
  '/ch6/standard-step', '/ch6/profiles', '/ch6/multi-reach',
  '/ch7/fall-velocity', '/ch7/shields', '/ch7/bed-load',
  '/design-wizard', '/cheat-sheet', '/workflow', '/reference',
  '/case-studies', '/batch',
];

// Install: cache app shell + offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for dynamic, offline fallback for navigation
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and external requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigation requests: network-first with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) =>
            cached || caches.match('/offline.html')
          )
        )
    );
    return;
  }

  // Static assets: cache-first with background update
  if (url.pathname.match(/\.(js|css|woff2?|svg|png|jpg|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Dynamic: network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
