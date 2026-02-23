const CACHE_NAME = 'personal-ledger-v1';
const STATIC_URLS = [
  './',
  './index.html',
  './login.html',
  './register.html',
  './style.css',
  './script.js',
  './manifest.json',
  './logo.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(STATIC_URLS.map((url) => cache.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.startsWith('https://www.gstatic.com/') || e.request.url.startsWith('https://fonts.') || e.request.url.includes('firebase')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached ? cached : fetch(e.request).then((res) => {
        const clone = res.clone();
        if (res.ok && e.request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return res;
      })
    )
  );
});
