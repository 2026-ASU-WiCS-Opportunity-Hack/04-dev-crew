const CACHE_NAME = 'wial-v1';

// Static assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/coaches',
  '/events',
];

// These paths are never cached — always fetch fresh from server
const NEVER_CACHE = [
  '/api/',
  '/dashboard/',
  '/login',
  '/unauthorized',
];

function shouldNeverCache(url) {
  return NEVER_CACHE.some((path) => url.pathname.startsWith(path));
}

// Install — precache shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache for public pages
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests on same origin
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Never cache auth, dashboard, or API routes — always go to network
  if (shouldNeverCache(url)) {
    return;
  }

  // Network first for everything else
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache a copy of successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache if available
        return caches.match(event.request);
      })
  );
});
