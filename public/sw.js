const CACHE = "psicoflow-v3"
const STATIC_CACHE = "psicoflow-static-v3"
const IMAGE_CACHE = "psicoflow-images-v3"

const PRECACHE_URLS = [
  "/",
  "/agendar",
  "/termos",
  "/privacidade",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/favicon-32.png",
  "/pwa-72-v2.png",
  "/pwa-96-v2.png",
  "/pwa-128-v2.png",
  "/pwa-144-v2.png",
  "/pwa-152-v2.png",
  "/pwa-192-v2.png",
  "/pwa-192-v2-maskable.png",
  "/pwa-384-v2.png",
  "/pwa-512-v2.png",
  "/pwa-512-v2-maskable.png",
]

const isImage = (url) => /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url)
const isFont = (url) => /\.(woff2?|ttf|otf|eot)$/i.test(url)
const isApi = (url) => url.includes("/api/")

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
      caches.open(STATIC_CACHE),
      caches.open(IMAGE_CACHE),
    ]).catch(() => {
      // Silently fail if precaching fails (offline first install)
    })
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== STATIC_CACHE && k !== IMAGE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and API calls
  if (request.method !== "GET" || isApi(url.pathname)) return

  // Network-first for HTML navigation
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithFallback(request))
    return
  }

  // Cache-first for images
  if (isImage(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  // Cache-first for fonts
  if (isFont(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Stale-while-revalidate for everything else
  event.respondWith(staleWhileRevalidate(request))
})

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const clone = response.clone()
      caches.open(CACHE).then((cache) => cache.put(request, clone))
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    // Fallback to root page
    return caches.match("/")
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.status === 200) {
      const clone = response.clone()
      caches.open(cacheName).then((cache) => cache.put(request, clone))
    }
    return response
  } catch {
    return new Response("", { status: 408 })
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      const clone = response.clone()
      caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
    }
    return response
  }).catch(() => cached)
  return cached || fetchPromise
}
