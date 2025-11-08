const CACHE_NAME = 'beautycurl-v1';
const CACHE_URLS = [
    './',
    './SiteBeautyCurl.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon/icon-192.png',
    './icon/icon-512.png',
    './offline.html'
];

self.addEventListener('install', event => {
    console.log('Service Worker: installing');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: activating');
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
});

// Fetch handler with offline fallback for navigations
self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // If request succeeds, optionally update cache and return response
                    return response;
                })
                .catch(() => caches.match('./offline.html'))
        );
        return;
    }

    // For other requests, try cache first then network, and cache new resources
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type === 'opaque') return response;
                const respClone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
                return response;
            }).catch(() => {
                // If request for an image fails, you could return a placeholder here
                return caches.match('./offline.html');
            });
        })
    );
});