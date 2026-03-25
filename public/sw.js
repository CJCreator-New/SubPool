// SubPool Service Worker — Workbox-compatible manual SW
// Provides offline fallback + network-first caching for API calls.

const CACHE_NAME = 'subpool-v1';
const ASSETS_TO_PRECACHE = [
    '/',
    '/browse',
    '/manifest.webmanifest',
];

// ─── Install: cache shell ─────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_PRECACHE))
    );
    self.skipWaiting();
});

// ─── Activate: clean old caches ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// ─── Fetch: network-first for API, cache-first for assets ─────────────────────
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Don't cache Supabase API calls
    if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/functions/')) {
        return; // Let browser handle it normally
    }

    // For navigation requests: network-first with fallback to /
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() =>
                caches.match('/').then(r => r || new Response('Offline', { status: 503 }))
            )
        );
        return;
    }

    // For static assets: cache-first
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (response.ok && event.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
