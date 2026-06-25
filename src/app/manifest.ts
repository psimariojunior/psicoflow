import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PsiHumanis - Gestão para Psicólogos",
    short_name: "PsiHumanis",
    description: "Sistema completo de gestão para psicólogos com agenda online, prontuários e sala virtual",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    categories: ["health", "business", "productivity"],
    lang: "pt-BR",
    dir: "ltr",
    scope: "/",
    id: "/",
    icons: [
      { src: "/pwa-72-v5.png", sizes: "72x72", type: "image/png" },
      { src: "/pwa-96-v5.png", sizes: "96x96", type: "image/png" },
      { src: "/pwa-128-v5.png", sizes: "128x128", type: "image/png" },
      { src: "/pwa-144-v5.png", sizes: "144x144", type: "image/png" },
      { src: "/pwa-152-v5.png", sizes: "152x152", type: "image/png" },
      { src: "/pwa-192-v5.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-192-v5-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa-384-v5.png", sizes: "384x384", type: "image/png" },
      { src: "/pwa-512-v5.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-512-v5-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Agendar Consulta", url: "/agendar", icons: [{ src: "/pwa-96-v5.png", sizes: "96x96" }] },
      { name: "Sala Virtual", url: "/sala-virtual", icons: [{ src: "/pwa-96-v5.png", sizes: "96x96" }] },
      { name: "Dashboard", url: "/dashboard", icons: [{ src: "/pwa-96-v5.png", sizes: "96x96" }] },
    ],
    prefer_related_applications: false,
    display_override: ["standalone", "window-controls-overlay"],
  }
}
