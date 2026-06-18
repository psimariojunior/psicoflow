"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, ClipboardList, ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Questionnaire {
  id: string
  title: string
  type: string
  _count: { questions: number; responses: number }
}

interface Response {
  id: string
  totalScore: number
  severity: string
  completedAt: string
  questionnaire: { id: string; title: string; type: string }
}

export default function QuestionariosPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tk = localStorage.getItem("patient_token")
    if (!tk) { setLoading(false); return }
    Promise.all([
      fetch("/api/pacientes/questionarios", { headers: { Authorization: `Bearer ${tk}` } }).then(r => r.ok ? r.json() : []),
      fetch("/api/pacientes/questionarios-respostas", { headers: { Authorization: `Bearer ${tk}` } }).then(r => r.ok ? r.json() : []),
    ])
      .then(([q, r]) => { setQuestionnaires(q); setResponses(r) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="pt-6"><div className="h-4 w-3/4 bg-muted rounded" /></CardContent></Card>)}
      </div>
    )
  }

  const lastResp = (qId: string) => responses.find(r => r.questionnaire.id === qId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Questionários Clínicos</h1>
        <p className="text-muted-foreground mt-1">Questionários disponíveis para preenchimento</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {questionnaires.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum questionário disponível no momento.</p>
          </div>
        ) : (
          questionnaires.map(q => {
            const lr = lastResp(q.id)
            return (
              <Card key={q.id} className={cn("transition-all", lr && "ring-2 ring-emerald-500/30")}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{q.title}</CardTitle>
                      <span className={cn("inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1", q.type === "PHQ9" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700")}>{q.type}</span>
                    </div>
                    {lr && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{q._count.questions} perguntas</span>
                    {lr && <span>Concluído</span>}
                  </div>
                  <Button asChild className="w-full" disabled={!!lr}>
                    <Link href={`/paciente/questionarios/${q.id}`}>
                      <Brain className="mr-2 h-4 w-4" />
                      {lr ? "Ver Resultado" : "Iniciar"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
      {responses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Histórico</h2>
          {responses.map(r => (
            <Card key={r.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{r.questionnaire.title}</h3>
                    <p className="text-sm text-muted-foreground">{new Date(r.completedAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{r.totalScore}</p>
                    <p className="text-xs text-muted-foreground">{r.severity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}