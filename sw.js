// sw.js - نسخه 2.0 با مدیریت کش پویا
const CACHE_VERSION = 'v15';  // تغییر نسخه = پاک شدن کش قبلی
const CACHE_NAME = `lingo-dict-${CACHE_VERSION}`;
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './scripts.js',
    './css/variables.css',
    './css/base.css',
    './css/layout.css',
    './css/components.css',
    './css/sections.css',
    './css/responsive.css',
    './css/dark-mode.css',
    './css/animations.css',
    './css/word-details.css',
    './css/mobile-fixes.css',
    './modules/dict-image-gen.js',
    './modules/dict-auto-fullscreen.js',
    './floating-menu-system.js',
    './language-config.js',
    './language-loader.js',
    './responsive.js',
    './verb-conjugation-data.js',
    './verb-prepositions-db.js',
    './icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
    'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2'
];

// نصب و ذخیره کش جدید
self.addEventListener('install', event => {
    console.log('[SW] نصب نسخه جدید', CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting(); // فعال شدن فوری
});

// فعال‌سازی و حذف کش‌های قدیمی
self.addEventListener('activate', event => {
    console.log('[SW] فعال‌سازی و پاکسازی کش‌های قدیمی');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] حذف کش قدیمی:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // کنترل فوری صفحات
});

// استراتژی: کش اول، سپس شبکه
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response; // برگرداندن از کش
            }
            return fetch(event.request).then(networkResponse => {
                // ذخیره در کش برای دفعات بعد
                if (event.request.method === 'GET' && 
                    event.request.url.startsWith(self.location.origin)) {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }
                return networkResponse;
            });
        }).catch(() => {
            // آفلاین - صفحه آفلاین سفارشی
            return caches.match('./index.html');
        })
    );
});