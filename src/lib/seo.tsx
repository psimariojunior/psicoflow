interface BreadcrumbItem {
  name: string
  item: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const baseUrl = "https://psihumanis.com.br"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.item.startsWith("http") ? crumb.item : `${baseUrl}${crumb.item}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "PsiHumanis",
    description: "Sistema de gestão para psicólogos com agenda online, prontuários e sala virtual",
    url: "https://psihumanis.com.br",
    areaServed: "BR",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços de Psicologia",
      itemListElement: [
        { "@type": "Offer", name: "Terapia Individual" },
        { "@type": "Offer", name: "Terapia de Casal" },
        { "@type": "Offer", name: "Terapia Online" },
        { "@type": "Offer", name: "Supervisão Clínica" },
      ],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
