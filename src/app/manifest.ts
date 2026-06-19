import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PsicoFlow - Gestão para Psicólogos",
    short_name: "PsicoFlow",
    description: "Sistema completo de gestão para psicólogos com agenda online, prontuários e sala virtual",
    start_url: "/",
    display: "standalone",
    background_color: "#10b981",
    theme_color: "#10b981",
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
    prefer_related_applications: false,
    display_override: ["standalone", "window-controls-overlay"],
  }
}
