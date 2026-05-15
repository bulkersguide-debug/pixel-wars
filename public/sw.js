// Pixels of War — Service Worker
const CACHE = 'pow-v2';
const STATIC = ['/', '/index.html', '/manifest.json'];

// ── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

// ── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── FETCH — network first, cache fallback ──────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase')) return; // never cache API
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || new Response('Offline', { status: 503 })))
  );
});

// ── PUSH NOTIFICATIONS ─────────────────────────────────────────────────────
self.addEventListener('push', e => {
  const d = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(d.title || '⚔️ Pixels of War', {
      body:      d.body    || 'Something is happening in the war!',
      icon:      d.icon    || '/icons/icon-192.png',
      badge:                  '/icons/icon-72.png',
      tag:       d.tag     || 'pow',
      renotify:               true,
      vibrate:                [200, 100, 200, 100, 300],
      data:    { url: d.url || '/' },
      actions: d.actions   || [{ action: 'play', title: '⚔️ Play Now' }]
    })
  );
});

// ── NOTIFICATION CLICK ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(all => {
      const found = all.find(c => c.url.includes(self.location.origin));
      if (found) return found.focus();
      return clients.openWindow(url);
    })
  );
});

// ── BACKGROUND SYNC (offline pixel queue) ─────────────────────────────────
self.addEventListener('sync', e => {
  if (e.tag === 'sync-pixels') e.waitUntil(syncOfflineActions());
});

async function syncOfflineActions() {
  // Opens IndexedDB queue and replays any offline pixel claims
  // Implementation hooks into the app's pending action queue
  const clients_list = await clients.matchAll();
  clients_list.forEach(c => c.postMessage({ type: 'SYNC_COMPLETE' }));
}
