const CACHE = 'gramswasthya-v1';
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['/','/login','/dashboard']))));
self.addEventListener('fetch', event => event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(cached => cached || caches.match('/dashboard')))));
