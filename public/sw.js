/* 牛马大逃杀 Service Worker
 * 策略：导航请求 network-first（保证更新可达，离线回退缓存）；
 * 静态资源 stale-while-revalidate（925 个生成素材不做安装期 precache，
 * 首次游玩时边用边缓存，二次进入全部秒开且可离线）。 */
const VER = 'niuma-v1';
const CORE = ['/', '/manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  /* 页面导航：先网络（拿最新 index.html），失败回缓存（离线可玩） */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(VER).then(c => c.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  /* 静态资源：缓存优先立即返回，同时后台刷新 */
  e.respondWith(
    caches.match(req).then(cached => {
      const refresh = fetch(req)
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(VER).then(c => c.put(req, copy)); }
          return res;
        })
        .catch(() => cached);
      return cached || refresh;
    })
  );
});
