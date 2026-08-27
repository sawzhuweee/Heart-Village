/* 心之村 Service Worker — 改動網站內容後，把 VERSION 加一，使用者就會拿到新版 */
const VERSION = 'v16';
const SHELL = 'village-shell-' + VERSION;
const RUNTIME = 'village-runtime-' + VERSION;

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL)
      // 個別加入：某個檔案失敗不會讓整個安裝掛掉
      .then((c) => Promise.all(SHELL_FILES.map((f) => c.add(f).catch(() => null))))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // 1) 導覽請求：先連線，離線時回快取的首頁
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // 2) 圖片與字型（Cloudinary / Google Fonts）：先快取，背景更新
  const isAsset =
    url.hostname === 'res.cloudinary.com' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    /\.(png|jpg|jpeg|webp|svg|gif|woff2?)$/i.test(url.pathname);

  if (isAsset) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res && (res.ok || res.type === 'opaque')) {
              const copy = res.clone();
              caches.open(RUNTIME).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // 3) 其他同源檔案：先快取，沒有就連線
  if (sameOrigin) {
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached))
    );
  }
});
