const CACHE_VERSION = 'v2';
const STATIC_CACHE = `promptcraft-static-${CACHE_VERSION}`;
const API_CACHE = `promptcraft-api-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-192x192.png',
  '/logo-512x512.png',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => ![STATIC_CACHE, API_CACHE].includes(name))
          .map((name) => caches.delete(name)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || new Response(JSON.stringify({ error: 'Offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(request)
        .then((response) => {
          if (request.mode === 'navigate') {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put('/index.html', responseClone));
          }
          return response;
        })
        .catch(async () => {
          if (request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/offline.html');
          }
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    }),
  );
});
