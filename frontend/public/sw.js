/**
 * AI-SKILL Service Worker
 *
 * Provides basic offline support for the static SPA:
 * - Precaches the app shell on install.
 * - Caches same-origin static assets at runtime with a cache-first strategy.
 * - Cleans up outdated caches on activate.
 */

const CACHE_VERSION = "v2";
const SHELL_CACHE = `ai-skill-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ai-skill-runtime-${CACHE_VERSION}`;

// Use relative URLs so the precache works when the site is hosted as a
// project page (e.g. /<repo>/) instead of at the domain root.
const SHELL_URLS = [
  "./",
  "./index.html",
  "./404.html",
  "./manifest.webmanifest",
  "./favicon.svg",
  "./skills.json",
  "./external-repos.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ai-skill-") && !key.includes(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only cache GET requests for same-origin resources.
  if (request.method !== "GET" || !new URL(request.url).origin.includes(self.location.origin)) {
    return;
  }

  // For the HTML shell and JSON index files, try network first so users get
  // fresh content when online, falling back to the cache when offline.
  const isNetworkFirst =
    request.mode === "navigate" ||
    request.url.endsWith("/skills.json") ||
    request.url.endsWith("/external-repos.json");

  if (isNetworkFirst) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || Response.error())),
    );
    return;
  }

  // For static assets (JS/CSS/fonts/images), cache first and refresh from
  // network in the background when possible.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Background revalidation: update the cache entry without blocking.
        fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, response.clone()));
            }
          })
          .catch(() => {
            // Offline: cached response is already being returned.
          });
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response.ok) return response;
        const clone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        return response;
      });
    }),
  );
});
