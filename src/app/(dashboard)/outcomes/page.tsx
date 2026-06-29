"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Users,
  Activity,
  Target,
  Brain,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react"
import Link from "next/link"

interface MoodEntry {
  date: string
  mood: number
  emotion: string | null
}

interface ScoreEntry {
  date: string
  score: number | null
  title: string | null
  category: string | null
}

interface PatientOutcome {
  patient: {
    id: string
    name: string
    daysInTreatment: number
  }
  moodTrend: MoodEntry[]
  scoreTrend: ScoreEntry[]
  stats: {
    totalAppointments: number
    completedAppointments: number
    attendanceRate: number
    totalTasks: number
    completedTasks: number
    taskCompletionRate: number
    diaryEntries: number
    questionnaireResponses: number
  }
  risk: {
    level: "low" | "medium" | "high"
    factors: string[]
  }
}

interface Summary {
  totalPatients: number
  highRisk: number
  mediumRisk: number
  lowRisk: number
  avgAttendanceRate: number
  avgTaskCompletion: number
}

export default function OutcomesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [outcomes, setOutcomes] = useState<PatientOutcome[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/clinica/outcomes")
      if (res.ok) {
        const data = await res.json()
        setOutcomes(data.outcomes || [])
        setSummary(data.summary || null)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const selected = outcomes.find(o => o.patient.id === selectedPatient)

  const riskColor = (level: string) => {
    switch (level) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "medium": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      default: return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    }
  }

  const riskLabel = (level: string) => {
    switch (level) {
      case "high": return "Alto Risco"
      case "medium": return "Atenção"
      default: return "Estável"
    }
  }

  const trendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />
    if (trend < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const MiniMoodChart = ({ data }: { data: MoodEntry[] }) => {
    if (data.length === 0) return <p className="text-xs text-muted-foreground">Sem dados</p>
    const maxMood = 10
    const barWidth = Math.max(100 / data.length, 4)
    return (
      <div className="flex items-end gap-px h-12">
        {data.slice(-20).map((entry, i) => (
          <div
            key={i}
            className="rounded-sm transition-all"
            style={{
              width: `${barWidth}%`,
              height: `${(entry.mood / maxMood) * 100}%`,
              backgroundColor: entry.mood >= 7 ? "#22c55e" : entry.mood >= 4 ? "#eab308" : "#ef4444",
              minHeight: "4px",
            }}
            title={`${entry.mood}/10 — ${entry.emotion || ""}`}
          />
        ))}
      </div>
    )
  }

  const MiniScoreChart = ({ data }: { data: ScoreEntry[] }) => {
    const validScores = data.filter(d => d.score !== null)
    if (validScores.length === 0) return <p className="text-xs text-muted-foreground">Sem scores</p>
    const maxScore = Math.max(...validScores.map(d => d.score || 0), 1)
    const barWidth = Math.max(100 / validScores.length, 4)
    return (
      <div className="flex items-end gap-px h-12">
        {validScores.slice(-10).map((entry, i) => (
          <div
            key={i}
            className="rounded-sm bg-blue-500 transition-all"
            style={{
              width: `${barWidth}%`,
              height: `${((entry.score || 0) / maxScore) * 100}%`,
              minHeight: "4px",
            }}
            title={`${entry.title}: ${entry.score}`}
          />
        ))}
      </div>
    )
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            Clinical Outcomes Intelligence
          </h1>
          <p className="text-muted-foreground">Análise de progresso e detecção de risco em tempo real</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pacientes</p>
                  <p className="text-2xl font-bold">{summary.totalPatients}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alto Risco</p>
                  <p className="text-2xl font-bold text-red-600">{summary.highRisk}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Activity className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Atenção</p>
                  <p className="text-2xl font-bold text-amber-600">{summary.mediumRisk}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Comparecimento</p>
                  <p className="text-2xl font-bold">{summary.avgAttendanceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tarefas</p>
                  <p className="text-2xl font-bold">{summary.avgTaskCompletion}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {summary && summary.highRisk > 0 && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  {summary.highRisk} paciente(s) em alto risco
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Pacientes com scores piorando ou sem registros recentes requerem atenção imediata.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Pacientes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {outcomes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum paciente encontrado</p>
              ) : (
                outcomes
                  .sort((a, b) => {
                    const order = { high: 0, medium: 1, low: 2 }
                    return order[a.risk.level] - order[b.risk.level]
                  })
                  .map(outcome => (
                    <button
                      key={outcome.patient.id}
                      onClick={() => setSelectedPatient(outcome.patient.id)}
                      className={`w-full text-left p-4 border-b dark:border-slate-800 hover:bg-muted/50 transition-colors ${
                        selectedPatient === outcome.patient.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{outcome.patient.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {outcome.patient.daysInTreatment} dias em tratamento
                          </p>
                        </div>
                        <Badge className={`${riskColor(outcome.risk.level)} border-0 text-xs`}>
                          {riskLabel(outcome.risk.level)}
                        </Badge>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">
              {selected ? selected.patient.name : "Selecione um paciente"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um paciente para ver a análise completa</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {selected.risk.factors.length > 0 && (
                  <div className={`p-4 rounded-lg ${riskColor(selected.risk.level)} bg-opacity-50`}>
                    <p className="font-medium text-sm mb-2">Fatores de Risco:</p>
                    <ul className="text-sm space-y-1">
                      {selected.risk.factors.map((f, i) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{selected.stats.diaryEntries}</p>
                    <p className="text-xs text-muted-foreground">Registros no Diário</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{selected.stats.attendanceRate}%</p>
                    <p className="text-xs text-muted-foreground">Comparecimento</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{selected.stats.taskCompletionRate}%</p>
                    <p className="text-xs text-muted-foreground">Tarefas Concluídas</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{selected.stats.questionnaireResponses}</p>
                    <p className="text-xs text-muted-foreground">Questionários</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Tendência de Humor</p>
                  <MiniMoodChart data={selected.moodTrend} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>14 dias atrás</span>
                    <span>Hoje</span>
                  </div>
                </div>

                {selected.scoreTrend.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Scores de Avaliação</p>
                    <MiniScoreChart data={selected.scoreTrend} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.from(new Set(selected.scoreTrend.map(s => s.title).filter(Boolean))).map(title => (
                        <Badge key={title} variant="outline" className="text-xs">{title}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link href={`/pacientes/${selected.patient.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Prontuário <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                  <Link href={`/sessoes?patient=${selected.patient.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Sessões <Calendar className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
