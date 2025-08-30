/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
// This array is injected at build-time by VitePWA (injectManifest).
precacheAndRoute(self.__WB_MANIFEST);

// Navigation fallback to index.html within the service worker scope.
// Works both on localhost ("/") and GitHub Pages ("/solar-charge-frontend/").
const indexUrl = new URL('index.html', self.registration.scope);
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL(indexUrl.href),
    {
      // Do not treat API routes as SPA navigations
      denylist: [/^\/api\//]
    }
  )
);

// Runtime caching for JS/CSS/workers: SWR
registerRoute(
  ({ request }) => ['script', 'style', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({ cacheName: 'assets-swr' })
);

// Runtime caching for images: Cache-First with expiration
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
);

// Network-first for API status (GET only), fallback to last good data if offline.
// This prevents caching control PUT requests.
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' && url.pathname.endsWith('/api/v1/status'),
  new NetworkFirst({
    cacheName: 'api-status',
    networkTimeoutSeconds: 4,
    plugins: [
      // Cache opaque and 200 OK responses
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 60 })
    ]
  })
);
