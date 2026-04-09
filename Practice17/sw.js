const CACHE_NAME = 'task-manager-v4';
const DYNAMIC_CACHE_NAME = 'dynamic-content-v2';

const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css',
    '/manifest.json',
    '/content/home.html',
    '/content/about.html',
    '/icons/launchericon-48x48.png',
    '/icons/launchericon-72x72.png',
    '/icons/launchericon-96x96.png',
    '/icons/launchericon-144x144.png',
    '/icons/launchericon-192x192.png',
    '/icons/launchericon-512x512.png'
];

self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching App Shell');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch(err => console.error('[SW] Cache error:', err))
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) return;

    if (url.pathname.startsWith('/content/')) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    const responseClone = networkResponse.clone();
                    caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then(cached => cached || caches.match('/content/home.html'));
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) return cachedResponse;
                return fetch(event.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        return new Response('No internet connection', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received', event);

    let data = {
        title: 'New notification',
        body: 'You have a new event',
        icon: '/icons/launchericon-192x192.png',
        badge: '/icons/launchericon-48x48.png',
        reminderId: null,
        timestamp: Date.now()
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon || '/icons/launchericon-192x192.png',
        badge: data.badge || '/icons/launchericon-48x48.png',
        vibrate: [200, 100, 200],
        data: {
            reminderId: data.reminderId,
            url: '/',
            timestamp: data.timestamp
        }
    };

    if (data.reminderId) {
        options.actions = [
            {
                action: 'snooze',
                title: 'Snooze for 5 minutes',
                icon: '/icons/launchericon-48x48.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/launchericon-48x48.png'
            }
        ];
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked', event);

    const notification = event.notification;
    const action = event.action;
    const reminderId = notification.data ? notification.data.reminderId : null;

    notification.close();

    if (action === 'snooze' && reminderId) {
        console.log('[SW] Snooze action triggered for reminder:', reminderId);

        event.waitUntil(
            fetch(`/snooze?reminderId=${reminderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    console.log('[SW] Snooze successful');
                    return self.registration.showNotification('Reminder snoozed', {
                        body: 'You will be reminded again in 5 minutes',
                        icon: '/icons/launchericon-192x192.png',
                        badge: '/icons/launchericon-48x48.png'
                    });
                } else {
                    console.error('[SW] Snooze failed:', response.status);
                }
            })
            .catch(err => console.error('[SW] Snooze error:', err))
        );
        return;
    }

    if (action === 'close') {
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                for (let client of windowClients) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});