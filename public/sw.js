// PWAとしてホーム画面に追加できるようにするための最小限のサービスワーカー。
// キャッシュは行わず、常にネットワークから取得する(ログイン状態や最新情報を壊さないため)。
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// インストール判定に必要な最小限のfetchリスナーとしてだけ存在させる。
// respondWith()を呼ばないことで、リクエストを横取りせずブラウザの通常の
// ネットワーク処理に任せる(横取りすると全リクエストが二重に発生し、読み込みが大幅に遅くなるため)。
self.addEventListener('fetch', () => {});
