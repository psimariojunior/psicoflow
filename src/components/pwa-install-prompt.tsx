"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { cn } from "@/lib/utils"

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

  if (dismissed || isStandalone) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 items-end">
      {deferredPrompt ? (
        <Button
          size="sm"
          className="shadow-lg gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => {
            (deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt()
            setDeferredPrompt(null)
          }}
        >
          <Download className="h-4 w-4" />
          Instalar App
        </Button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="bg-card border rounded-lg shadow-lg p-3 max-w-[240px] text-sm">
            <p className="font-medium mb-1">Instale o PsicoFlow</p>
            <p className="text-xs text-muted-foreground mb-2">
              No Chrome: menu ⋮ &rarr; Adicionar &agrave; tela inicial
            </p>
            <p className="text-xs text-muted-foreground">
              No Safari: compartilhar &rarr; Adicionar &agrave; tela de in&iacute;cio
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
