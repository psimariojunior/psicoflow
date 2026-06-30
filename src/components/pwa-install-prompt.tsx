"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Smartphone, Zap, Bell, Shield } from "lucide-react"
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
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-card border rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-indigo-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Instale o PsiHumanis</p>
                  <p className="text-xs text-teal-100">Acesse em 1 toque, sem navegador</p>
                </div>
              </div>
              <button
                className="text-teal-200 hover:text-white transition-colors rounded-lg p-1"
                onClick={handleDismiss}
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <Zap className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">Acesso rápido à agenda e sala virtual</p>
              </div>
              <div className="flex items-start gap-2.5">
                <Bell className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">Notificações de consultas e lembretes</p>
              </div>
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">Funciona offline com dados em cache</p>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white shadow-lg shadow-teal-500/20 gap-1.5"
                onClick={handleInstall}
              >
                <Download className="h-4 w-4" />
                Instalar agora
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
