const CACHE_NAME = 'rabisco-v1';
const PRECACHE_URLS = [
  '/Rabisco/',
  '/Rabisco/index.html',
  '/Rabisco/offline.html',
  '/Rabisco/icon-192.png',
  '/Rabisco/icon-512.png'
];

// Install - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
    .then(() => self.clients.claim())
  );
});

// Fetch - try cache, then network, fallback to offline page
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        // Optional: cache runtime GET requests (images, API responses) - be conservative
        // const cl = resp.clone();
        // caches.open(CACHE_NAME).then(cache => cache.put(event.request, cl));
        return resp;
      }).catch(() => {
        // If navigation request fails, show offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/Rabisco/offline.html');
        }
      });
    })
  );
});
