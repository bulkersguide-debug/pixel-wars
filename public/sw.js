// Pixels of War — Service Worker (passthrough, no caching)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// No fetch handler — let everything pass through normally
self.addEventListener('push', e => {
  const d = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(d.title || '⚔️ Pixels of War', {
      body: d.body || 'Action in the war!',
      icon: '/icons/icon-192.png',
      tag: 'pow'
    })
  );
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});
