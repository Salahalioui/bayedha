// sw.js - Service Worker for Bayedha Progressive Web App (Offline Capabilities)
const CACHE_NAME = 'bayedha-cache-v1.4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/main.css',
  './js/translations.js',
  './js/data.js',
  './js/supabase-client.js',
  './js/store.js',
  './js/map.js',
  './js/compressor.js',
  './js/app.js',
  './assets/img/logo.jpg',
  './assets/img/mosque_touiza.jpg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network first, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
