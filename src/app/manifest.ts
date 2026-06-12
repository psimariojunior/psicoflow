import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PsicoFlow - Gestão para Psicólogos",
    short_name: "PsicoFlow",
    description: "Sistema completo de gestão para psicólogos com agenda online, prontuários e sala virtual",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  }
}
