// ============================================
// কাচাবাজার Admin PWA — Service Worker
// Version 1.1
// ============================================

const CACHE_NAME = 'kachabazar-admin-v1.1';
const OFFLINE_URL = '/admin/admin-offline.html';

const PRECACHE_ASSETS = [
  '/admin/dashboard.html',
  '/admin/index.html',
  '/admin/orders.html',
  '/admin/order-detail.html',
  '/admin/products.html',
  '/admin/product-form.html',
  '/admin/packing-slip.html',
  '/admin/customers.html',
  '/admin/settings.html',
  '/admin/admin-manifest.json',
  '/admin/icons/admin-icon-192.png',
  '/admin/icons/admin-icon-512.png',
  '/admin/icons/admin-icon-maskable-512.png',
  '/admin/css/admin.css',
  '/admin/js/admin-auth.js',
  '/admin/js/utils.js',
  '/admin/js/admin-data.js',
  '/admin/js/admin-layout.js',
  '/admin/js/admin-orders.js',
  '/admin/js/admin-products.js',
  '/admin/js/admin-pwa-init.js',
  'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of PRECACHE_ASSETS) {
        try {
          await cache.add(new Request(url, { cache: 'reload' }));
        } catch (e) {
          console.warn('Admin precache failed:', url);
        }
      }
      try { await cache.add(OFFLINE_URL); } catch {}
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // HTML navigation
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const netRes = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, netRes.clone());
          return netRes;
        } catch {
          const cached = await caches.match(req);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          return offline || new Response('অফলাইন', { status: 503 });
        }
      })()
    );
    return;
  }

  // ইমেজ
  if (req.destination === 'image') {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        try {
          const netRes = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, netRes.clone());
          return netRes;
        } catch {
          return new Response('', { status: 404 });
        }
      })()
    );
    return;
  }

  // CSS/JS/Fonts
  if (
    req.destination === 'style' ||
    req.destination === 'script' ||
    req.destination === 'font' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    url.hostname === 'cdnjs.cloudflare.com'
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            caches.open(CACHE_NAME).then(c => c.put(req, res.clone()));
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })()
    );
    return;
  }

  // বাকি সব
  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req);
        if (res && res.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        const cached = await caches.match(req);
        return cached || new Response('অফলাইন', { status: 503 });
      }
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});