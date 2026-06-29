"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Shield, FileJson, AlertTriangle, CheckCircle2 } from "lucide-react"
import { usePatientAuth } from "@/components/patient-auth-provider"

export default function LGPDExportPage() {
  const { token } = usePatientAuth()
  const [loading, setLoading] = useState(false)
  const [exported, setExported] = useState(false)

  const handleExport = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch("/api/pacientes/lgpd-export", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Erro ao exportar")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `psiHumanis-meus-dados-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setExported(true)
    } catch {
      alert("Erro ao exportar dados. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-500" />
          Meus Dados (LGPD)
        </h1>
        <p className="text-muted-foreground mt-2">
          Conforme a Lei Geral de Proteção de Dados (Art. 18), você tem direito de acessar e exportar todos os seus dados pessoais.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>O que está incluído na exportação</CardTitle>
          <CardDescription>
            Todos os dados pessoais e clínicos associados à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Dados pessoais (nome, CPF, telefone, endereço)",
            "Registros do diário de emoções",
            "Histórico de consultas",
            "Respostas de questionários",
            "Tarefas atribuídas",
            "Faturas e pagamentos",
            "Sessões terapêuticas",
            "Registros de consentimento",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-700 dark:text-amber-300">Aviso de Segurança</p>
              <p className="text-amber-600 dark:text-amber-400 mt-1">
                O arquivo exportado contém informações pessoais e sensíveis. Mantenha-o em local seguro.
                O compartilhamento indevido pode gerar sanções legais conforme a LGPD.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {exported ? (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Dados exportados com sucesso! Verifique sua pasta de downloads.
          </p>
        </div>
      ) : (
        <Button onClick={handleExport} disabled={loading} size="lg" className="w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <Download className="h-4 w-4 animate-bounce" />
              Preparando exportação...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Baixar Meus Dados (JSON)
            </span>
          )}
        </Button>
      )}
    </div>
  )
}
