// ============================================
// কাচাবাজার PWA — Service Worker
// Version 1.1
// ============================================

const CACHE_NAME = 'kachabazar-v1.2';
const OFFLINE_URL = 'offline.html';
const siteURL = (path) => new URL(path, self.registration.scope).toString();

// Pre-cache: প্রথম ইনস্টলে সেভ হবে
const PRECACHE_ASSETS = [
  './',
  'index.html',
  'shop.html',
  'cart.html',
  'checkout.html',
  'account.html',
  'wishlist.html',
  'about.html',
  'contact.html',
  'districts.html',
  'login.html',
  'product.html',
  '404.html',
  'offline.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'css/variables.css',
  'css/style.css',
  'js/data.js',
  'js/utils.js',
  'js/layout.js',
  'js/main.js',
  'js/shop.js',
  'js/product.js',
  'js/pwa-init.js',
  'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

// ============================================
// INSTALL — প্রি-ক্যাশ
// ============================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // একটি একটি করে ক্যাশ (একটি fail হলেও অন্যগুলো কাজ করবে)
      for (const url of PRECACHE_ASSETS) {
        try {
          const assetURL = url.startsWith('http') ? url : siteURL(url);
          await cache.add(new Request(assetURL, { cache: 'reload' }));
        } catch (e) {
          console.warn('Precache failed:', url);
        }
      }
      // অফলাইন পেজ নিশ্চিত
      try {
        await cache.add(siteURL(OFFLINE_URL));
      } catch {}
      // সাথে সাথে activate
      await self.skipWaiting();
    })()
  );
});

// ============================================
// ACTIVATE — পুরনো ক্যাশ মুছুন
// ============================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
      await self.clients.claim();
    })()
  );
});

// ============================================
// FETCH — ক্যাশিং স্ট্র্যাটেজি
// ============================================
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // শুধু GET
  if (req.method !== 'GET') return;

  // admin পাথ স্কিপ
  if (url.pathname.startsWith('/admin/')) return;

  // Chrome extension স্কিপ
  if (url.protocol === 'chrome-extension:') return;

  // ---- HTML navigation — Network First → Cache → Offline ----
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
          const offline = await caches.match(siteURL(OFFLINE_URL));
          return offline || new Response('অফলাইন', { status: 503 });
        }
      })()
    );
    return;
  }

  // ---- ইমেজ — Cache First ----
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
          // প্লেসহোল্ডার ইমেজ
          return new Response(
            '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#e5e7eb" width="200" height="200"/><text x="100" y="105" text-anchor="middle" fill="#9ca3af" font-size="14">ছবি নেই</text></svg>',
            { headers: { 'Content-Type': 'image/svg+xml' } }
          );
        }
      })()
    );
    return;
  }

  // ---- CSS/JS/Fonts — Stale-While-Revalidate ----
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
          .then((netRes) => {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(req, netRes.clone()));
            return netRes;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })()
    );
    return;
  }

  // ---- বাকি সব — Network → Cache ----
  event.respondWith(
    (async () => {
      try {
        const netRes = await fetch(req);
        if (netRes && netRes.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, netRes.clone());
        }
        return netRes;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response('অফলাইন', { status: 503 });
      }
    })()
  );
});

// ============================================
// MESSAGE — Force update
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(keys => {
      keys.forEach(k => caches.delete(k));
    });
  }
});