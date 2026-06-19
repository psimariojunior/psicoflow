"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Smartphone } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

declare global {
  interface Window { __deferredPwaPrompt: Event | null }
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return
    const dismissedFlag = localStorage.getItem("pwa-dismissed")
    if (dismissedFlag && Date.now() - Number(dismissedFlag) < 7 * 24 * 60 * 60 * 1000) {
      setDismissed(true)
      return
    }
    if (window.__deferredPwaPrompt) setDeferredPrompt(window.__deferredPwaPrompt)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = useCallback(() => {
    const p = deferredPrompt as unknown as { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }
    p.prompt()
    p.userChoice.then((choice) => {
      if (choice.outcome === "accepted") setDeferredPrompt(null)
    })
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem("pwa-dismissed", String(Date.now()))
  }, [])

  return (
    <AnimatePresence>
      {deferredPrompt && !dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80"
        >
          <div className="bg-card border rounded-2xl shadow-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Instalar PsicoFlow</p>
              <p className="text-xs text-muted-foreground">Acesso rápido com um toque</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-1.5 shadow-lg shadow-blue-500/20"
              onClick={handleInstall}
            >
              <Download className="h-3.5 w-3.5" />
              Instalar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
