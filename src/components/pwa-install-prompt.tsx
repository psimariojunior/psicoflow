"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

declare global {
  interface Window { __deferredPwaPrompt: Event | null }
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return
    if (window.__deferredPwaPrompt) setDeferredPrompt(window.__deferredPwaPrompt)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!deferredPrompt) return null

  return (
    <Button
      className="fixed bottom-20 right-4 z-50 shadow-lg gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
      onClick={() => {
        const p = deferredPrompt as unknown as { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
        p.prompt()
        setDeferredPrompt(null)
      }}
    >
      <Download className="h-4 w-4" />
      Instalar App
    </Button>
  )
}
