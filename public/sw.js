// Pixels of War — Service Worker v3 (safe minimal)
const CACHE = 'pow-v3';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network first — never block the app loading
self.addEventListener('fetch', e => {
  // Skip non-GET and supabase/API calls entirely
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase')) return;
  if (e.request.url.includes('googleapis')) return;
  if (e.request.url.includes('discord')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Only cache successful same-origin responses
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Offline fallback — serve cached version if available
        return caches.match(e.request).then(r => r || caches.match('/'));
      })
  );
});

// Push notifications
self.addEventListener('push', e => {
  const d = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(d.title || '⚔️ Pixels of War', {
      body:     d.body   || 'Something is happening in the war!',
      icon:     '/icons/icon-192.png',
      badge:    '/icons/icon-72.png',
      tag:      d.tag    || 'pow',
      vibrate:  [200, 100, 200],
      data:   { url: d.url || '/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(all => {
      const found = all.find(c => c.url.includes(self.location.origin));
      if (found) return found.focus();
      return clients.openWindow(e.notification.data?.url || '/');
    })
  );
});
