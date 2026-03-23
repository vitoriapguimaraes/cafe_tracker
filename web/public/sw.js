self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (event) => {
  // Para instalação básica, o fetch precisa apenas responder (mesmo que da rede)
  event.respondWith(fetch(event.request));
});
