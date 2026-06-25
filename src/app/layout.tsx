import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Providers } from "./providers"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"
import { CookieConsent } from "@/components/cookie-consent"
import { GoogleAnalytics } from "@/components/google-analytics"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const siteUrl = "https://psihumanis.vercel.app"
const siteName = "PsiHumanis"
const title = "PsiHumanis — Sistema de Gestão para Psicólogos | Agenda Online, Prontuários e Sala Virtual"
const description = "Sistema completo de gestão para psicólogos. Agende consultas online, emita prontuários, gerencie finanças e realize atendimentos via sala virtual segura. Tudo em um só lugar."

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    "psicologia", "gestão para psicólogos", "agenda online psicólogo",
    "prontuário psicológico", "sala virtual psicologia", "terapia online",
    "atendimento psicológico", "software psicologia", "psicólogo",
    "consulta online", "CRP", "clínica de psicologia",
  ],
  authors: [{ name: "PsiHumanis" }],
  creator: "PsiHumanis",
  publisher: "PsiHumanis",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName,
    title,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PsiHumanis - Gestão para Psicólogos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
    creator: "@psihumanis",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon-32.png",
    apple: "/pwa-192-v5.png",
  },
  appleWebApp: {
    capable: true,
    title: "PsiHumanis",
    statusBarStyle: "black-translucent",
    startupImage: ["/pwa-512-v5.png"],
  },
  manifest: "/manifest",
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "PsiHumanis",
      description: "Sistema de gestão para psicólogos com agenda online, prontuários e sala virtual",
      url: siteUrl,
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
    }),
    "mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers><main className="animate-fade-in">{children}</main><PwaInstallPrompt /></Providers>
        <Script id="pwa-capture" strategy="beforeInteractive">
          {`
            window.__deferredPwaPrompt = null;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              window.__deferredPwaPrompt = e;
            });
          `}
        </Script>
        <GoogleAnalytics />
        <Script id="pwa-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
              });
            }
          `}
        </Script>
        <CookieConsent />
      </body>
    </html>
  )
}
