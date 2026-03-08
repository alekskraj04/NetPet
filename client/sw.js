const CACHE_NAME = 'netpet-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/app.css',
  './app.mjs',
  './assets/icon-192.png', // Denne finnes, så denne er trygg!
  './views/UserView.html',
  './views/GAMEVIEW.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Nå vil denne fullføre uten feil fordi alle filene eksisterer
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});