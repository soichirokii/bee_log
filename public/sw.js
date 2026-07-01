// v2: キャッシュを一切持たない素通しSW。
// 旧バージョンのSWがprecacheした古いアセット（古いnoimage等）が
// 一部端末で配信され続ける問題があったため、activate時に全キャッシュを一掃する。
const SW_VERSION = 'v2-purge-legacy-cache';

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

// 常にネットワークから取得（キャッシュしない）
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});