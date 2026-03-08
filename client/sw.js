const CACHE_NAME = 'netpet-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/app.css',
  '/app.mjs',
  '/assets/favicon.png',
  '/views/UserView.html',
  '/views/GAMEVIEW.html'
];

// Installerer Service Worker og lagrer filer i cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Henter filer fra cache hvis vi er offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});