// PWAとしてホーム画面に追加できるようにするための最小限のサービスワーカー。
// キャッシュは行わず、常にネットワークから取得する(ログイン状態や最新情報を壊さないため)。
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
