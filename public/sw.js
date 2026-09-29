/* groky chat service worker：只缓存本站静态外壳，绝不拦截跨域（API）请求 */
const VERSION = 'groky-v1.0.0';
const ASSETS = [
  './', 'index.html', 'style.css', 'app.js', 'manifest.json',
  'vendor/marked.min.js', 'vendor/purify.min.js', 'vendor/highlight.min.js',
  'vendor/hl-light.css', 'vendor/hl-dark.css',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API 请求直连，不经缓存

  if (req.mode === 'navigate') {
    // 页面：网络优先，离线回退到缓存外壳
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put('index.html', copy));
        return res;
      }).catch(() => caches.match('index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // 静态资源：stale-while-revalidate
  e.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const net = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
