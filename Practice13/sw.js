const CACHE_NAME = 'task-cache-v2';

const ASSETS = [
    '/',
    '/index.html',
    '/app.js',
    '/styles.css'
];

self.addEventListener('install', event => {
    console.log('[SW] Установка Service Worker');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Кэширование статических ресурсов');
                return cache.addAll(ASSETS);
            })
            .then(() => {
                console.log('[SW] Все ресурсы закэшированы');
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
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Удаление старого кэша:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Старые кэши удалены');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
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