"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { Shield, AlertTriangle, Phone, ExternalLink, ChevronDown, ChevronUp, BookOpen, Sparkles, Lock, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface Protocol {
  id: string
  title: string
  description?: string
  content: string
  category?: string
  tags?: string
  createdAt: string
}

export default function ProtocolosCrisePage() {
  const router = useRouter()
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const { token, loading: authLoading } = usePatientAuth()

  useEffect(() => {
    if (authLoading || !token) { setLoading(false); return }
    fetch("/api/pacientes/protocolos-crise", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setProtocols)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, authLoading])

  const toggleExpanded = (id: string) => {
    setExpanded(prev => prev === id ? null : id)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center py-12">
        <Lock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">Faça login para acessar seus protocolos.</p>
        <Button asChild className="mt-4"><Link href="/paciente/login">Entrar</Link></Button>
      </div>
    )
  }

  const emergencyNumbers = [
    { name: "CVV - Centro de Valorização da Vida", number: "188", desc: "Apoio emocional 24h, gratuito e sigiloso" },
    { name: "SAMU", number: "192", desc: "Emergências médicas" },
    { name: "Bombeiros", number: "193", desc: "Emergências de risco à vida" },
    { name: "Polícia", number: "190", desc: "Situações de violência ou perigo imediato" },
  ]

  return (
    <div className="space-y-6 relative">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Protocolos de Crise
          </h1>
          <p className="text-muted-foreground mt-1">Recursos e orientações para momentos de emergência emocional</p>
        </div>
        <Button variant={emergencyMode ? "destructive" : "outline"} onClick={() => setEmergencyMode(v => !v)} className="shrink-0">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {emergencyMode ? "Fechar Emergência" : "Modo Emergência"}
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Números de Emergência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {emergencyNumbers.map((e, i) => (
              <a key={i} href={`tel:${e.number}`} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-blue-100 hover:border-blue-300 transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.desc}</p>
                </div>
                <span className="text-lg font-bold text-blue-600">{e.number}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Meus Protocolos
        </h2>
        {protocols.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">Nenhum protocolo atribuído</h3>
              <p className="text-muted-foreground">Seu psicólogo pode atribuir protocolos personalizados para situações de crise.</p>
            </CardContent>
          </Card>
        ) : (
          protocols.map(protocol => (
            <Card key={protocol.id} className={cn("overflow-hidden transition-all", expanded === protocol.id && "ring-2 ring-blue-500/30")}>
              <CardHeader className="cursor-pointer" onClick={() => toggleExpanded(protocol.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{protocol.title}</CardTitle>
                      {protocol.description && <p className="text-sm text-muted-foreground">{protocol.description}</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); toggleExpanded(protocol.id); }}>
                    {expanded === protocol.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
                </div>
              </CardHeader>
              {expanded === protocol.id && (
                <div>
                  <Separator />
                  <CardContent className="pt-4">
                    {protocol.content.split("\n").map((line, idx) => <p key={idx} className="mb-2 text-sm">{line}</p>)}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                      <Button asChild variant="outline" size="sm"><a href="tel:188"><Phone className="h-4 w-4 mr-1" />CVV 188</a></Button>
                      <Button asChild variant="outline" size="sm"><a href="tel:192"><AlertTriangle className="h-4 w-4 mr-1" />SAMU 192</a></Button>
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(protocol.content)}><ExternalLink className="h-4 w-4 mr-1" />Copiar</Button>
                    </div>
                  </CardContent>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {emergencyMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-50/95 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-red-500">
            <div className="text-center mb-6">
              <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">Precisa de Ajuda Agora?</h2>
              <p className="text-muted-foreground">Ligue imediatamente:</p>
            </div>
            <div className="space-y-3 mb-6">
              {emergencyNumbers.map((e, i) => (
                <a key={i} href={`tel:${e.number}`} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-red-700">{e.name}</p>
                    <p className="text-sm text-red-500">{e.desc}</p>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{e.number}</span>
                </a>
              ))}
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => setEmergencyMode(false)}>
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}