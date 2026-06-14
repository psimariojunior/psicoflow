"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import toast from "react-hot-toast"

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = useCallback(() => {
    if (deferredPrompt) {
      (deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt()
      setDeferredPrompt(null)
      return
    }
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      toast("No Chrome: menu \u22EE > Adicionar \u00E0 tela inicial\nNo Safari: compartilhar > Adicionar \u00E0 tela de in\u00EDcio", { duration: 5000 })
    } else {
      toast("Clique no \u00EDcone de instalar na barra de endere\u00E7o do navegador", { duration: 5000 })
    }
  }, [deferredPrompt])

  if (dismissed || isStandalone) return null

  return (
    <Button
      size="sm"
      className="fixed bottom-20 right-4 z-50 shadow-lg gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
      onClick={handleInstall}
    >
      <Download className="h-4 w-4" />
      Instalar App
      <button
        onClick={(e) => { e.stopPropagation(); setDismissed(true) }}
        className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-white/20"
      >
        <X className="h-3 w-3" />
      </button>
    </Button>
  )
}
