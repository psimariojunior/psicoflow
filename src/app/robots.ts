import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/sala-virtual/", "/paciente/"],
    },
    sitemap: "https://psicoflow-iota.vercel.app/sitemap.xml",
  }
}
