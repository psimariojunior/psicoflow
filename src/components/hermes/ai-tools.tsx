"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Brain, AlertCircle, CheckCircle2, Copy, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface AiSoapGeneratorProps {
  onInsert: (soap: string) => void
  className?: string
}

export function AiSoapGenerator({ onInsert, className }: AiSoapGeneratorProps) {
  const [keywords, setKeywords] = useState("")
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!keywords.trim()) { toast.error("Digite palavras-chave da sessão"); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/hermes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "gerar-soap", keywords: keywords.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.response)
        setModel(data.model)
      } else {
        toast.error(data.error || "Erro ao gerar SOAP")
      }
    } catch {
      toast.error("Erro de conexão com a IA")
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = () => {
    if (result) {
      onInsert(result)
      toast.success("SOAP inserido no prontuário")
    }
  }

  return (
    <Card className={cn("border-blue-200/50 dark:border-blue-800/30", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-sm">IA — Gerar Prontuário SOAP</CardTitle>
            <p className="text-xs text-muted-foreground">Hermes Agent · Modelos gratuitos</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Palavras-chave da sessão</label>
          <Textarea
            placeholder="Ex: ansiedade social, medo de falar em público, evitação, sudorese, pensamentos catastróficos..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            rows={3}
            className="resize-none text-sm"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !keywords.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20"
          size="sm"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...</>
          ) : (
            <><Brain className="mr-2 h-4 w-4" /> Gerar SOAP com IA</>
          )}
        </Button>

        {model && (
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 mr-1 text-blue-500" />
            {model}
          </Badge>
        )}

        {result && (
          <div className="relative">
            <div className="absolute top-2 right-2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard.writeText(result); toast.success("Copiado!") }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleGenerate}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4 pr-16 text-sm whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {result}
            </div>
            <Button onClick={handleInsert} size="sm" className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Brain className="mr-2 h-4 w-4" /> Inserir no Prontuário
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function AiMoodAnalysis({ entries, className }: { entries: string; className?: string }) {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!entries.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/hermes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analisar-diario", entries: entries }),
      })
      const data = await res.json()
      if (data.success) {
        setAnalysis(data.response)
        setModel(data.model)
      } else {
        toast.error(data.error || "Erro ao analisar")
      }
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={cn("border-violet-200/50 dark:border-violet-800/30", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <CardTitle className="text-sm">IA — Análise de Humor</CardTitle>
            <p className="text-xs text-muted-foreground">Identifica padrões e sugere intervenções</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAnalyze} disabled={loading} variant="outline" size="sm" className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analisando...</> : <><Brain className="mr-2 h-4 w-4" /> Analisar Diário Emocional</>}
        </Button>
        {model && <Badge variant="outline" className="mt-2 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1 text-violet-500" />{model}</Badge>}
        {analysis && (
          <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {analysis}
          </div>
        )}
      </CardContent>
    </Card>
  )
}