"use client"

import { motion } from "framer-motion"
import { Brain, Heart, Activity, CalendarDays, ArrowRight } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface TimelineSession {
  id: string
  date: string
  status: string
  moodBefore?: number | null
  moodAfter?: number | null
  type?: string | null
  notes?: string | null
  tags?: string | null
}

interface SessionTimelineProps {
  sessions: TimelineSession[]
  currentId?: string
  onSelect?: (id: string) => void
}

const moodColor = (mood: number | null | undefined) => {
  if (mood == null) return "bg-gray-200"
  if (mood <= 3) return "bg-red-400"
  if (mood <= 5) return "bg-amber-400"
  if (mood <= 7) return "bg-lime-400"
  return "bg-emerald-400"
}

const moodEmoji = (mood: number | null | undefined) => {
  if (mood == null) return "—"
  if (mood <= 3) return "😔"
  if (mood <= 5) return "😐"
  if (mood <= 7) return "🙂"
  return "😊"
}

export function SessionTimeline({ sessions, currentId, onSelect }: SessionTimelineProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Nenhuma sessão registrada ainda</p>
      </div>
    )
  }

  const hasMoodData = sessions.some((s) => s.moodBefore != null || s.moodAfter != null)

  return (
    <div className="relative">
      {sessions.map((session, i) => {
        const isCurrent = session.id === currentId
        const isLast = i === sessions.length - 1

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={cn(
              "relative flex gap-4 pb-6 cursor-pointer group",
              isLast && "pb-0"
            )}
            onClick={() => onSelect?.(session.id)}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                  isCurrent
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-lg shadow-emerald-500/20"
                    : "border-muted-foreground/20 bg-card group-hover:border-emerald-300"
                )}
              >
                <span className="text-xs font-bold text-muted-foreground group-hover:text-emerald-600 transition-colors">
                  {sessions.length - i}
                </span>
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-gradient-to-b from-border to-transparent mt-1" />
              )}
            </div>

            <div
              className={cn(
                "flex-1 rounded-xl border p-4 transition-all",
                isCurrent
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-md"
                  : "border-border bg-card group-hover:border-emerald-200 dark:group-hover:border-emerald-800 group-hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {session.type && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                      {session.type === "INDIVIDUAL" ? "Individual" :
                       session.type === "COUPLE" ? "Casal" :
                       session.type === "FAMILY" ? "Família" :
                       session.type === "GROUP" ? "Grupo" :
                       session.type === "SUPERVISION" ? "Supervisão" : session.type}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      session.status === "COMPLETED" ? "success" :
                      session.status === "IN_PROGRESS" ? "warning" :
                      "secondary"
                    }
                    className="text-[10px] px-1.5 py-0 h-5"
                  >
                    {session.status === "COMPLETED" ? "Concluída" :
                     session.status === "IN_PROGRESS" ? "Em andamento" :
                     session.status === "PAUSED" ? "Pausada" : session.status}
                  </Badge>
                </div>
              </div>

              {session.tags && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {session.tags.split(",").map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary/70">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {hasMoodData && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Heart className="h-3 w-3 text-rose-400" />
                      <span>Pré: {moodEmoji(session.moodBefore)}</span>
                      {session.moodBefore != null && (
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", moodColor(session.moodBefore))}
                            style={{ width: `${(session.moodBefore / 10) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-3 w-3" />
                    <div className="flex items-center gap-1.5">
                      <Heart className="h-3 w-3 text-emerald-400" />
                      <span>Pós: {moodEmoji(session.moodAfter)}</span>
                      {session.moodAfter != null && (
                        <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", moodColor(session.moodAfter))}
                            style={{ width: `${(session.moodAfter / 10) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
                {!hasMoodData && (
                  <div className="flex items-center gap-1.5">
                    <Brain className="h-3 w-3 text-violet-400" />
                    <span>Sessão {sessions.length - i}</span>
                  </div>
                )}
              </div>

              {session.notes && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                  &ldquo;{session.notes.replace(/<[^>]*>/g, "").slice(0, 120)}{session.notes.length > 120 ? "..." : ""}&rdquo;
                </p>
              )}

              {isCurrent && (
                <div className="mt-2">
                  <Badge variant="info" className="text-[10px]">
                    Sessão atual
                  </Badge>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}

      {hasMoodData && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/50">
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-emerald-500" />
            Evolução Emocional
          </h4>
          <div className="space-y-2">
            {sessions.filter(s => s.moodBefore != null || s.moodAfter != null).slice(0, 10).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 text-xs">
                <span className="w-16 text-muted-foreground">{formatDate(s.date).slice(0, 6)}</span>
                <div className="flex-1 flex items-center gap-1">
                  {s.moodBefore != null && (
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-rose-400" style={{ width: `${(s.moodBefore / 10) * 100}%` }} />
                    </div>
                  )}
                  <ArrowRight className="h-2.5 w-2.5 text-muted-foreground mx-1" />
                  {s.moodAfter != null && (
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${(s.moodAfter / 10) * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
