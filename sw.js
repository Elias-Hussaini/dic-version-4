// sw.js - Service Worker برای Elias.Dictionary
const CACHE_NAME = 'elias-dictionary-v1';

// فایل‌هایی که باید کش شوند
const urlsToCache = [
  './',
  './index.html',
  './styles-1.css',
  './styles-2.css',
  './styles-3.css',
  './styles-4.css',
  './styles-5.css',
  './scripts.js',
  './floating-menu-system.js',
  './language-config.js',
  './language-loader.js',
  './responsive.js',
  './verb-conjugation-data.js',
  './verb-prepositions-db.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// نصب Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// پاسخ به درخواست‌ها - استراتژی Cache First, Network Fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// فعال‌سازی و پاک کردن کش قدیمی
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});