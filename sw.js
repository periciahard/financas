const CACHE_NAME = 'financas-familia-v33-3-13-acoes-nuvem-categorias-receitas';
const APP_SHELL = [
  './',
  './index.html',
  './app.js',
  './financeiro-data.js',
  './manifest.webmanifest',
  './supabase-config.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/social-preview.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request, {cache:'no-store'}).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(event.request, {ignoreSearch:true});
      return cached || caches.match('./index.html');
    })
  );
});
