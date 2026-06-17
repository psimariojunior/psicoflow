"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Smile, Heart, Meh, Frown, Angry } from "lucide-react"

interface MoodEntry {
  date: string
  mood: number
}

const moodIcons = [Angry, Frown, Meh, Smile, Heart]
const moodColors = [
  "text-red-400 bg-red-500/10",
  "text-orange-400 bg-orange-500/10",
  "text-yellow-400 bg-yellow-500/10",
  "text-primary bg-emerald-500/10",
  "text-green-400 bg-green-500/10",
]

export function MoodChart({ entries = [], className }: { entries: MoodEntry[]; className?: string }) {
  const weeklyData = useMemo(() => {
    const now = new Date()
    const days: { label: string; mood: number | null }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      const match = entries.find((e) => e.date.startsWith(key))
      days.push({
        label: d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3),
        mood: match?.mood ?? null,
      })
    }
    return days
  }, [entries])

  const avgMood = useMemo(() => {
    if (entries.length === 0) return 0
    return entries.reduce((s, e) => s + e.mood, 0) / entries.length
  }, [entries])

  const streak = useMemo(() => {
    let count = 0
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    for (const e of sorted) {
      if (e.mood >= 4) count++
      else break
    }
    return count
  }, [entries])

  if (entries.length === 0) return null

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Tendência de Humor</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Últimos 7 dias</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-primary" />
              Média: {avgMood.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Smile className="h-3 w-3 text-green-400" />
              Dias bons: {streak}
            </span>
          </div>
        </div>

        <div className="flex items-end gap-3 h-24">
          {weeklyData.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="flex-1 flex items-end">
                {day.mood !== null ? (
                  <div
                    className={cn(
                      "w-full rounded-full transition-all duration-500",
                      moodColors[day.mood - 1]?.split(" ")[1] || "bg-muted"
                    )}
                    style={{
                      height: `${(day.mood / 5) * 100}%`,
                      minHeight: "8px",
                    }}
                  />
                ) : (
                  <div className="w-full h-2 rounded-full bg-muted/50" />
                )}
              </div>
              {day.mood !== null ? (
                <div className={cn("flex items-center justify-center", moodColors[day.mood - 1]?.split(" ")[0] || "text-muted-foreground")}>
                  {moodIcons[day.mood - 1] ? (
                    (() => { const Icon = moodIcons[day.mood - 1]; return <Icon className="h-3.5 w-3.5" /> })()
                  ) : null}
                </div>
              ) : (
                <div className="h-3.5 w-3.5 rounded-full bg-muted/50" />
              )}
              <span className="text-[10px] text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
