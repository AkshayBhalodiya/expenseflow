// Minimal SW — do not cache Next.js assets (prevents broken CSS/JS)
const CACHE_NAME = 'expenseflow-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept dev, Next.js internals, API, or static assets
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    /\.(css|js|map|woff2?|png|jpg|svg|ico)$/i.test(url.pathname)
  ) {
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
