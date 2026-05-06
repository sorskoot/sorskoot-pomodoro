const CACHE_NAME = 'sorskoot-pomodoro-v1';
const OFFLINE_FALLBACK_URL = '/sorskoot-pomodoro/index.html';
const APP_SHELL = [
  '/sorskoot-pomodoro/',
  OFFLINE_FALLBACK_URL,
  '/sorskoot-pomodoro/manifest.webmanifest',
  '/sorskoot-pomodoro/icons/icon-192.svg',
  '/sorskoot-pomodoro/icons/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.error(
          'Navigation fetch failed, falling back to cached index.html:',
          error,
        );
        return caches.match(OFFLINE_FALLBACK_URL);
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (
          !response ||
          response.status !== 200 ||
          (response.type !== 'basic' && response.type !== 'cors')
        ) {
          return response;
        }

        const responseToCache = response.clone();
        void caches.open(CACHE_NAME).then((cache) => {
          void cache.put(event.request, responseToCache).catch((error) => {
            console.error(
              `Failed to update cache entry for ${event.request.url}:`,
              error,
            );
          });
        });

        return response;
      });
    }),
  );
});
