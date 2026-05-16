// Pixels of War — Service Worker v2
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// No fetch caching — let everything pass through
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data?.json() || {}; } catch { data = { title: '⚔️ Pixels of War', body: e.data?.text() || 'Action in the war!' }; }

  const title = data.title || '⚔️ Pixels of War';
  const options = {
    body: data.body || 'Something happened on the grid!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: data.tag || 'pow-notification',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    actions: data.actions || [
      { action: 'open', title: '⚔️ View Grid' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Focus existing tab if open
      for (const client of clientList) {
        if (client.url.includes('pixelsofwar.com') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('notificationclose', e => {
  // Track dismissals if needed
});
