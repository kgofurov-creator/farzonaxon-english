// Farzonaxon English — internetsiz ishlash uchun service worker.
// Strategiya: "avval tarmoq, bo'lmasa kesh". Internet bor paytda doim eng yangi versiya olinadi
// (yangilanishlar o'zi keladi), internet yo'q paytda oxirgi saqlangan nusxa ishlaydi.
const CACHE = 'farzonaxon-english-v1';

self.addEventListener('install', (event) => {
  // Asosiy fayllarni oldindan saqlab qo'yamiz
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['./', 'index.html', 'flutter_bootstrap.js', 'main.dart.js', 'manifest.json', 'favicon.png']).catch(() => {}),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Faqat o'z fayllarimiz (yangi darslar boshqa manzildan keladi — ilovaning o'zi boshqaradi)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(req, { cache: 'no-cache' });
        if (fresh && fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      } catch (e) {
        const cached = await cache.match(req, { ignoreSearch: true });
        if (cached) return cached;
        if (req.mode === 'navigate') {
          const index = await cache.match('index.html');
          if (index) return index;
        }
        throw e;
      }
    })(),
  );
});
