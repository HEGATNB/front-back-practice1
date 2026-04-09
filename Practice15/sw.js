const CACHE_NAME = 'task-manager-v2';
const DYNAMIC_CACHE_NAME = 'dynamic-content-v1';

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
    console.log('[SW] Установка Service Worker');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Кэширование App Shell');
                return cache.addAll(ASSETS);
            })
            .then(() => {
                console.log('[SW] App Shell закэширован');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Ошибка кэширования:', err);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] Активация Service Worker');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
                        console.log('[SW] Удаление старого кэша:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Готов к работе');
            return self.clients.claim();
        })
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
                        .then(cached => {
                            if (cached) return cached;
                            if (url.pathname.includes('home')) {
                                return caches.match('/content/home.html');
                            }
                            return new Response('Страница недоступна офлайн', { status: 503 });
                        });
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
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
                        return new Response('Нет подключения к интернету', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});