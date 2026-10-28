/* Minimal service worker: it lets Chrome offer "Install app".
   Pages always load fresh from GitHub, so an updated form is used at once. */
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) { self.clients.claim(); });
self.addEventListener('fetch', function (e) { /* pass through to the network */ });
