/* AI Golf Coach service worker — offline shell + static asset cache. */
var VERSION = "agc-v1";
var STATIC_CACHE = "agc-static-" + VERSION;
var PAGE_CACHE = "agc-pages-" + VERSION;
var OFFLINE_URL = "/offline.html";
var PRECACHE = [OFFLINE_URL, "/icons/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) { return cache.addAll(PRECACHE); }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key.indexOf("agc-") === 0 && key !== STATIC_CACHE && key !== PAGE_CACHE) {
          return caches.delete(key);
        }
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isStaticAsset(pathname) {
  return pathname.indexOf("/_next/") === 0 ||
    pathname.indexOf("/icons/") === 0 ||
    /\.(png|jpg|jpeg|svg|webp|ico|woff2?|txt)$/.test(pathname);
}

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache the API — reviews, payments and uploads must always be fresh.
  if (url.pathname.indexOf("/api/") === 0) return;

  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.match(request).then(function (hit) {
          if (hit) return hit;
          return fetch(request).then(function (res) {
            if (res && res.ok) cache.put(request, res.clone());
            return res;
          }).catch(function () { return hit || Response.error(); });
        });
      })
    );
    return;
  }

  // Navigations: network-first, fall back to cache, then to the offline page.
  event.respondWith(
    fetch(request).then(function (res) {
      if (res && res.ok && request.mode === "navigate") {
        var cache = caches.open(PAGE_CACHE);
        cache.then(function (c) { c.put(request, res.clone()); });
      }
      return res;
    }).catch(function () {
      return caches.open(PAGE_CACHE).then(function (cache) {
        return cache.match(request).then(function (hit) {
          return hit || cache.match(OFFLINE_URL);
        });
      });
    })
  );
});
