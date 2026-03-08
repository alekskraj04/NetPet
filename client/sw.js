const CACHE_NAME = 'netpet-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/app.css',
  './app.mjs',
  './assets/icon-192.png', // This file exists and is used as the PWA icon
  './views/UserView.html',
  './views/GAMEVIEW.html'
];

// Installs the Service Worker and caches essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll will now complete successfully as all files exist
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Intercepts network requests to serve files from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Returns cached resource or fetches from network if not in cache
      return response || fetch(event.request);
    })
  );
});