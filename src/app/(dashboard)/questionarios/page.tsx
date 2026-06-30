"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, ClipboardList, Users, BarChart3, TrendingUp, FileText, Download, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestionnaireInfo {
  id: string
  title: string
  type: string
  description: string | null
  _count: { questions: number; responses: number }
}

const typeConfig: Record<string, { color: string; icon: any; desc: string }> = {
  PHQ9: { color: "from-teal-500 to-indigo-600", icon: Brain, desc: "Depressão" },
  GAD7: { color: "from-violet-500 to-purple-600", icon: Brain, desc: "Ansiedade" },
  BECK: { color: "from-rose-500 to-pink-600", icon: ClipboardList, desc: "Depressão (21 itens)" },
  PSS: { color: "from-amber-500 to-orange-600", icon: BarChart3, desc: "Estresse Percebido" },
  MINI: { color: "from-emerald-500 to-teal-600", icon: ClipboardList, desc: "Triagem Psiquiátrica" },
}

export default function QuestionariosPage() {
  const [questionnaires, setQuestionnaires] = useState<QuestionnaireInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [totalResponses, setTotalResponses] = useState(0)

  useEffect(() => {
    fetch("/api/questionarios")
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setQuestionnaires(data)
        setTotalResponses(data.reduce((sum: number, q: QuestionnaireInfo) => sum + q._count.responses, 0))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
            Questionários Clínicos
          </h1>
          <p className="text-muted-foreground mt-1">Avaliações disponíveis para os pacientes</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{totalResponses} resposta{totalResponses !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {questionnaires.map(q => {
          const cfg = typeConfig[q.type] || { color: "from-slate-500 to-slate-600", icon: ClipboardList, desc: "" }
          const Icon = cfg.icon
          return (
            <Card key={q.id} className="hover:shadow-lg hover:shadow-teal-500/5 transition-all group">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shrink-0 group-hover:scale-110 transition-all duration-300", cfg.color)}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{q.title}</CardTitle>
                    <Badge variant="outline" className="mt-1 text-[10px]">{q.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{q._count.questions} perguntas</span>
                  <span>{q._count.responses} resposta{q._count.responses !== 1 ? "s" : ""}</span>
                </div>
                <Button asChild className="w-full" size="sm">
                  <Link href={`/relatorios?tipo=paciente&questionario=${q.id}`}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Ver Resultados
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-teal-950/30 dark:to-indigo-950/30 border-teal-200/50 dark:border-teal-800/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Relatório de Avaliações</h3>
              <p className="text-sm text-muted-foreground mb-4">Exporte um relatório completo com todas as avaliações de um paciente em PDF.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/relatorios">
                  <Download className="mr-2 h-4 w-4" />
                  Ir para Relatórios
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}