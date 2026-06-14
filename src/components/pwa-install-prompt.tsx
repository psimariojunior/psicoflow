"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    window.addEventListener("appinstalled", () => setInstalled(true))
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (installed || !deferredPrompt) return null

  return (
    <Button
      size="sm"
      className="fixed bottom-20 right-4 z-50 shadow-lg gap-2"
      onClick={() => {
        (deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt()
        setDeferredPrompt(null)
      }}
    >
      <Download className="h-4 w-4" />
      Instalar App
    </Button>
  )
}
