// v3: リクエストを一切横取りしないSW。
// v2の素通し(respondWith(fetch(e.request)))は、/api/notion-image の
// 302リダイレクト画像(→Cloudinary、クロスオリジン)をopaque応答にしてしまい、
// 通常リロード時に画像がグレー(表示不可)になっていた。
// respondWithを呼ばず全てブラウザ標準処理に任せることで解消する。
const SW_VERSION = 'v3-no-intercept';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      // 旧SWが作った Cache Storage を全削除（古い画像の居座りを解消）
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

// respondWith を呼ばない = 全リクエストをブラウザ標準のネットワーク処理に委ねる。
// （PWAインストール可能性のために fetch ハンドラ自体は残す）
self.addEventListener('fetch', () => {});