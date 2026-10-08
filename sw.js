/* ============================================
   SERVICE WORKER
   Cache-first برای static، Network-first برای HTML
   ============================================ */

const VERSION = 'v1.0.0';
const CACHE_STATIC = `ms-static-${VERSION}`;
const CACHE_DYNAMIC = `ms-dynamic-${VERSION}`;
const CACHE_HTML = `ms-html-${VERSION}`;

/* ============================================
   PRECACHE (خود فایل‌های مهم)
   ============================================ */

const PRECACHE_URLS = [
  './',
  './index.html',
  './404.html',
  './manifest.json',
  './css/reset.css',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
];

/* ============================================
   INSTALL
   ============================================ */

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

/* ============================================
   ACTIVATE
   ============================================ */

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (
            key !== CACHE_STATIC &&
            key !== CACHE_DYNAMIC &&
            key !== CACHE_HTML
          ) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* ============================================
   FETCH
   ============================================ */

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // فقط GET
  if (request.method !== 'GET') return;

  // فقط same-origin یا jsdelivr
  const isSameOrigin = url.origin === self.location.origin;
  const isCDN = url.hostname === 'cdn.jsdelivr.net';

  if (!isSameOrigin && !isCDN) return;

  // HTML → Network-first (به‌روزرسانی محتوا)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, CACHE_HTML));
    return;
  }

  // Static (CSS, JS, fonts, images) → Cache-first
  event.respondWith(cacheFirst(request, CACHE_STATIC));
});

/* ============================================
   STRATEGIES
   ============================================ */

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fallback برای 404
    if (request.mode === 'navigate') {
      const offline = await caches.match('./404.html');
      if (offline) return offline;
    }
    return new Response('Offline', { status: 503 });
  }
}

/* ============================================
   MESSAGE (skipWaiting from client)
   ============================================ */

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});