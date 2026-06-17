"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Cookie } from "lucide-react"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("cookie_consent")
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted")
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem("cookie_consent", "rejected")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-background/95 backdrop-blur-xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Este site usa cookies</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Utilizamos cookies para melhorar sua experiência. Ao continuar, você concorda com nossa{" "}
              <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={reject} className="text-xs h-9">
            Recusar
          </Button>
          <Button size="sm" onClick={accept} className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-xs h-9 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30">
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  )
}
