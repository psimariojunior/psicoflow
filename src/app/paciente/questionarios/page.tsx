"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { Brain, ArrowRight, CheckCircle2, Lock, ArrowLeft } from "lucide-react"
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
  const router = useRouter()
  const { token, loading: authLoading } = usePatientAuth()
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !token) { setLoading(false); return }
    Promise.all([
      fetch("/api/pacientes/questionarios", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
      fetch("/api/pacientes/questionarios-respostas", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : []),
    ])
      .then(([q, r]) => { setQuestionnaires(q); setResponses(r) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, authLoading])

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="h-6 w-20 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-5 w-3/4 bg-muted rounded" /><div className="h-4 w-16 bg-muted rounded mt-2" /></CardHeader>
              <CardContent><div className="h-4 w-1/3 bg-muted rounded mb-4" /><div className="h-9 w-full bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="text-center py-12">
        <Lock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">Faça login para acessar os questionários.</p>
        <Button asChild className="mt-4"><Link href="/paciente/login">Entrar</Link></Button>
      </div>
    )
  }

  const lastResp = (qId: string) => responses.find(r => r.questionnaire.id === qId)

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Questionários Clínicos</h1>
        <p className="text-muted-foreground mt-1">Questionários disponíveis para preenchimento</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 animate-stagger">
        {questionnaires.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum questionário disponível no momento.</p>
          </div>
        ) : (
          questionnaires.map(q => {
            const lr = lastResp(q.id)
            return (
              <Card key={q.id} className={cn("transition-all card-hover", lr && "ring-2 ring-blue-500/30")}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{q.title}</CardTitle>
                      <span className={cn("inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1",
                        q.type === "PHQ9" ? "bg-blue-100 text-blue-700" :
                        q.type === "GAD7" ? "bg-purple-100 text-purple-700" :
                        q.type === "BAI" ? "bg-orange-100 text-orange-700" :
                        q.type === "BDI" ? "bg-indigo-100 text-indigo-700" :
                        q.type === "PSS" ? "bg-teal-100 text-teal-700" :
                        q.type === "ISI" ? "bg-slate-200 text-slate-700" :
                        q.type === "WHOQOL" ? "bg-emerald-100 text-emerald-700" :
                        "bg-gray-100 text-gray-700"
                      )}>{q.type}</span>
                    </div>
                    {lr && <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4">{q._count.questions} perguntas</div>
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
    </div>
  )
}