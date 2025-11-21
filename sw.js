const CACHE_NAME = 'rhema-portal-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: 安裝中...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: 快取檔案');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Service Worker: 快取失敗', error);
            })
    );

    // 強制跳過等待，立即啟用
    self.skipWaiting();
});

// 啟用 Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: 啟用中...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: 清除舊快取', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    // 立即控制所有頁面
    return self.clients.claim();
});

// 攔截請求
self.addEventListener('fetch', (event) => {
    // 跳過非 GET 請求
    if (event.request.method !== 'GET') {
        return;
    }

    // 跳過 Microsoft 登入相關的請求
    if (event.request.url.includes('microsoft') ||
        event.request.url.includes('login') ||
        event.request.url.includes('graph.microsoft.com') ||
        event.request.url.includes('alcdn.msauth.net')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 快取命中，返回快取
                if (response) {
                    console.log('Service Worker: 從快取返回', event.request.url);
                    return response;
                }

                // 快取未命中，發起網路請求
                console.log('Service Worker: 網路請求', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // 檢查是否為有效回應
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 複製回應
                        const responseToCache = response.clone();

                        // 快取新的回應
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: 網路請求失敗', error);

                        // 這裡可以返回離線頁面
                        // return caches.match('/offline.html');
                    });
            })
    );
});

// 處理訊息
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
