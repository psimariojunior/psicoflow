"use client"

import { useMemo } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"

interface ProgressData {
  [type: string]: {
    typeLabel: string
    responses: {
      id: string
      completedAt: string
      totalScore: number
      severity: string
    }[]
    latestScore: number
    previousScore: number | null
    change: number | null
    trend: "improving" | "stable" | "worsening"
    severity: string
  }
}

const typeColors: Record<string, { bar: string; bg: string; text: string }> = {
  PHQ9: { bar: "#22c55e", bg: "bg-green-500/10", text: "text-green-600" },
  GAD7: { bar: "#ef4444", bg: "bg-red-500/10", text: "text-red-600" },
  BECK: { bar: "#3b82f6", bg: "bg-blue-500/10", text: "text-blue-600" },
  PSS: { bar: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-600" },
  MINI: { bar: "#8b5cf6", bg: "bg-purple-500/10", text: "text-purple-600" },
}

const typeLabels: Record<string, string> = {
  PHQ9: "PHQ-9",
  GAD7: "GAD-7",
  BECK: "BDI",
  PSS: "PSS-10",
  MINI: "MINI",
}

function fetcher(url: string) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erro ao buscar dados")
    return res.json()
  })
}

export function ProgressTracker({ patientId, className }: { patientId: string; className?: string }) {
  const { data, error, isLoading } = useSWR<ProgressData>(
    `/api/pacientes/${patientId}/questionarios/progresso`,
    fetcher,
  )

  const types = useMemo(() => {
    if (!data) return []
    return (Object.entries(data) as [string, ProgressData[string]][])
      .filter(([_, v]) => v.responses.length > 0)
  }, [data])

  if (isLoading) {
    return (
      <Card className={cn("p-5 space-y-4", className)}>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("p-5", className)}>
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          Erro ao carregar progresso
        </div>
      </Card>
    )
  }

  if (types.length === 0) {
    return (
      <Card className={cn("p-5", className)}>
        <p className="text-sm text-muted-foreground">
          Nenhuma avaliação encontrada para este paciente.
        </p>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-5 space-y-6">
        <div>
          <h3 className="font-semibold text-foreground text-sm">Progresso das Avaliações</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Evolução dos scores ao longo do tempo
          </p>
        </div>

        {types.map(([type, data]) => {
          const colors = typeColors[type] || { bar: "#6b7280", bg: "bg-gray-500/10", text: "text-gray-600" }
          const sorted = [...data.responses].sort(
            (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime(),
          )
          const maxScore = Math.max(...sorted.map(r => r.totalScore), 1)

          return (
            <div key={type} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("font-medium", colors.bg, colors.text)}>
                    {data.typeLabel}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {data.latestScore}
                  </span>
                  {data.change !== null && (
                    <span className={cn(
                      "text-xs flex items-center gap-0.5",
                      data.change > 0 ? "text-red-500" : data.change < 0 ? "text-green-500" : "text-muted-foreground",
                    )}>
                      {data.change > 0 ? <TrendingUp className="h-3 w-3" /> : data.change < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      {data.change > 0 ? "+" : ""}{data.change}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded",
                    data.trend === "improving" ? "bg-green-500/10 text-green-600" :
                    data.trend === "worsening" ? "bg-red-500/10 text-red-600" :
                    "bg-muted text-muted-foreground",
                  )}>
                    {data.trend === "improving" ? "Melhorando" :
                     data.trend === "worsening" ? "Piorando" : "Estável"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {data.severity}
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-1.5 h-24">
                {sorted.map((r, i) => {
                  const pct = Math.max(((r.totalScore ?? 0) / maxScore) * 100, 3)
                  return (
                    <div key={r.id} className="flex-1 flex flex-col items-center gap-1 justify-end h-full">
                      <span className="text-[10px] font-medium text-foreground">{r.totalScore}</span>
                      <div
                        className="w-full rounded-t-md transition-all duration-300"
                        style={{
                          height: `${pct}%`,
                          background: colors.bar,
                          minHeight: "4px",
                          maxHeight: "100px",
                        }}
                      />
                      <span className="text-[9px] text-muted-foreground text-center leading-tight">
                        {new Date(r.completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
