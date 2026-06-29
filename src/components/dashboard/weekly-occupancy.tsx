"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Appointment {
  id: string
  startTime: Date
  status: string
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function WeeklyOccupancy({ appointments }: { appointments: Appointment[] }) {
  const weekData = useMemo(() => {
    const counts = Array(7).fill(0)
    for (const apt of appointments) {
      if (apt.status === "CANCELLED") continue
      const day = apt.startTime.getDay()
      counts[day]++
    }
    const max = Math.max(...counts, 1)
    return DAY_NAMES.map((name, i) => ({
      name,
      count: counts[i],
      pct: Math.round((counts[i] / max) * 100),
      isToday: new Date().getDay() === i,
    }))
  }, [appointments])

  const total = weekData.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-white via-violet-50/30 to-white dark:from-slate-900 dark:via-violet-950/10 dark:to-slate-900 shadow-lg shadow-violet-500/5">
      <div className="h-1 bg-gradient-to-r from-violet-400 via-purple-400 to-violet-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40">
              <BarChart3 className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="font-semibold">Ocupação Semanal</p>
              <p className="text-xs text-muted-foreground font-normal">
                {total} {total === 1 ? "sessão" : "sessões"} esta semana
              </p>
            </div>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-32">
          {weekData.map((day) => (
            <div key={day.name} className="flex-1 flex flex-col items-center gap-1.5">
              <span className={cn(
                "text-[10px] font-medium tabular-nums",
                day.isToday ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"
              )}>
                {day.count}
              </span>
              <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                <div
                  className={cn(
                    "w-full max-w-8 rounded-t-md transition-all duration-500",
                    day.isToday
                      ? "bg-gradient-to-t from-violet-600 to-violet-400 shadow-md shadow-violet-500/20"
                      : day.count > 0
                      ? "bg-gradient-to-t from-violet-200 to-violet-100 dark:from-violet-800/50 dark:to-violet-700/30"
                      : "bg-muted/30"
                  )}
                  style={{ height: day.count > 0 ? `${Math.max(day.pct, 8)}%` : "4px" }}
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                day.isToday
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-muted-foreground"
              )}>
                {day.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
