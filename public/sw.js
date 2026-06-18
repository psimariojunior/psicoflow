const CACHE = "psicoflow-v5"
const STATIC_CACHE = "psicoflow-static-v5"
const IMAGE_CACHE = "psicoflow-images-v5"

const PRECACHE_URLS = [
  "/",
  "/agendar",
  "/termos",
  "/privacidade",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/favicon-32.png",
  "/pwa-72-v4.png",
  "/pwa-96-v4.png",
  "/pwa-128-v4.png",
  "/pwa-144-v4.png",
  "/pwa-152-v4.png",
  "/pwa-192-v4.png",
  "/pwa-192-v4-maskable.png",
  "/pwa-384-v4.png",
  "/pwa-512-v4.png",
  "/pwa-512-v4-maskable.png",
  "/og-image.png",
  "/logo.png",
]

const isImage = (url) => /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url)
const isFont = (url) => /\.(woff2?|ttf|otf|eot)$/i.test(url)
const isApi = (url) => url.includes("/api/")
const isNextStatic = (url) => url.includes("/_next/")
const isDashboardPage = (url) => /^\/(dashboard|paciente|agenda|sessoes|prontuarios|financeiro|cobrancas|notificacoes|comunicacao|relatorios|diario-emocoes|configuracoes|disponibilidade|sala-virtual|pacientes)(\/|$)/.test(url)

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
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() => {
      self.clients.claim()
      // Force-reload all open tabs
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.navigate(client.url))
      })
    })
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET") return

  // API calls: network only
  if (isApi(url.pathname)) return

  // _next/ static: cache-first with long TTL
  if (isNextStatic(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Dashboard/patient pages: network-first with offline fallback
  if (isDashboardPage(url.pathname) || request.mode === "navigate") {
    event.respondWith(networkFirstWithFallback(request))
    return
  }

  // Images: cache-first
  if (isImage(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  // Fonts: cache-first
  if (isFont(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // Everything else: stale-while-revalidate
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
