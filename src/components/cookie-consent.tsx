"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Cookie, ChevronDown, ChevronUp } from "lucide-react"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("cookie_consent")
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted")
    window.dispatchEvent(new Event("cookie-consent-changed"))
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem("cookie_consent", "rejected")
    window.dispatchEvent(new Event("cookie-consent-changed"))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-background/95 backdrop-blur-xl shadow-2xl p-5 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 shrink-0 mt-0.5">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Este site usa cookies</p>
            <p className="text-xs text-muted-foreground mt-1">
              Utilizamos cookies essenciais para o funcionamento do site e, com seu consentimento,
              cookies de análise para melhorar sua experiência. Ao continuar navegando, você
              concorda com nossa{" "}
              <a href="/privacidade" className="text-primary hover:underline">Política de Privacidade</a>.
            </p>
          </div>
          <button
            onClick={reject}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            aria-label="Fechar banner de cookies"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Ocultar detalhes" : "Ver detalhes dos cookies"}
        </button>

        {expanded && (
          <div className="text-xs text-muted-foreground space-y-2 bg-muted/50 rounded-lg p-3">
            <div>
              <p className="font-medium text-foreground">Essenciais (sempre ativos)</p>
              <p>Necessários para login, autenticação e segurança. Não podem ser desativados.</p>
              <p className="text-[11px] mt-0.5">Cookies: next-auth.session-token, next-auth.csrf-token</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Funcionais</p>
              <p>Armazenam suas preferências (idioma, tema, consentimento).</p>
              <p className="text-[11px] mt-0.5">Cookies: psihumanis-locale, psihumanis-theme, cookie_consent</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Análise (requer consentimento)</p>
              <p>Google Analytics para entender como o site é utilizado. Só carrega se você aceitar.</p>
              <p className="text-[11px] mt-0.5">Cookies: _ga, _gid</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={reject} className="text-xs h-9">
            Recusar
          </Button>
          <Button size="sm" onClick={accept} className="bg-gradient-to-r from-teal-500 to-teal-600 text-xs h-9 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30">
            Aceitar Todos
          </Button>
        </div>
      </div>
    </div>
  )
}
