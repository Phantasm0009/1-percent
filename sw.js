const CACHE_NAME = 'daily-1-percent-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Background sync for notifications
self.addEventListener('sync', event => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder());
  }
});

// Push notification handler
self.addEventListener('push', event => {
  const options = {
    body: 'Time for your daily 1% improvement!',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'checkin',
        title: 'Mark as Done',
        icon: '/icon-192.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Daily 1% Reminder', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'checkin') {
    // Handle quick check-in action
    event.waitUntil(
      clients.openWindow('/').then(client => {
        if (client) {
          client.postMessage({ action: 'quickCheckin' });
        }
      })
    );
  } else {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

function sendDailyReminder() {
  return self.registration.showNotification('Your 1% awaits! 🎯', {
    body: 'Time for your daily habit improvement',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    tag: 'daily-reminder',
    requireInteraction: true
  });
}
