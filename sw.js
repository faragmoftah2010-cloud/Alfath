const V = 'alfath-v1';
const ASSETS = ['./', 'index.html', 'manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ملفات التطبيق نفسها فقط: الشبكة أولاً، ثم النسخة المحفوظة عند انقطاع الإنترنت.
// طلبات Firebase والخطوط تذهب للشبكة مباشرة.
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        const copy = res.clone();
        caches.open(V).then(c => c.put(r, copy));
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match('index.html')))
  );
});
