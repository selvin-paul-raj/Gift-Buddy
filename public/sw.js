/* eslint-disable no-console */
/* eslint-disable no-undef */

/**
 * GiftBuddy Service Worker
 * Production-grade PWA service worker with offline support
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `giftbuddy-${CACHE_VERSION}`;
const RUNTIME_CACHE = `giftbuddy-runtime-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/gift.svg',
  '/gift.png',
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        // Use addAll with error handling - skip missing files
        for (const url of PRECACHE_URLS) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (error) {
            console.warn(`[SW] Failed to precache ${url}:`, error);
          }
        }
        console.log('[SW] Precache completed');
      } catch (error) {
        console.error('[SW] Precache failed:', error);
      }
    })()
  );

  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );

      await self.clients.claim();
      console.log('[SW] Activation completed');
    })()
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip data: requests
  if (url.protocol === 'data:') {
    return;
  }

  // API requests - network first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Next.js chunks - network first (don't cache chunks as they change)
  if (url.pathname.includes('/_next/static/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't try to clone responses that might be already consumed
          if (!response || !response.ok) {
            return response;
          }
          
          // Clone immediately before any async operations
          const responseClone = response.clone();
          
          // Cache in background without blocking response
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          }).catch((err) => {
            console.warn('[SW] Failed to cache:', err);
          });
          
          return response;
        })
        .catch((error) => {
          console.log('[SW] Chunk fetch failed:', request.url, error);
          // Return cached version if available
          return caches.match(request).then((cached) => {
            return cached || new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Navigation requests - network first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request, '/offline.html'));
    return;
  }

  // Static assets - cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default - stale while revalidate
  event.respondWith(staleWhileRevalidate(request));
});

/**
 * Cache Strategies
 */

async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      // Clone the response before caching
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', request.url);
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithFallback(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      return response;
    }
  } catch (error) {
    console.log('[SW] Network request failed:', request.url);
  }

  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  // Return fallback page
  return caches.match(fallbackUrl);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      // Clone the response before caching
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Cache miss and network failed:', request.url);
    return new Response('Not found', { status: 404 });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      // Don't cache error responses
      if (!response.ok) {
        return response;
      }

      // Clone before caching to avoid consuming the body
      const responseToCache = response.clone();
      
      caches.open(RUNTIME_CACHE).then((cache) => {
        cache.put(request, responseToCache);
      });

      return response;
    })
    .catch(() => {
      console.log('[SW] Network failed for:', request.url);
      return cached || new Response('Offline', { status: 503 });
    });

  return cached || fetchPromise;
}

/**
 * Helper functions
 */

function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.webp',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
  ];

  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Message handler for SW updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded');
