"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export function GoogleAnalytics() {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    const check = () => {
      const consent = localStorage.getItem("cookie_consent")
      setConsented(consent === "accepted")
    }
    check()
    window.addEventListener("cookie-consent-changed", check)
    return () => window.removeEventListener("cookie-consent-changed", check)
  }, [])

  if (!GA_ID || !consented) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            anonymize_ip: true,
          });
        `}
      </Script>
    </>
  )
}
