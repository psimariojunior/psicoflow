"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { getInitials, formatDate, formatTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Brain, Clock, Plus, Search, Activity, Heart, Filter } from "lucide-react"

interface TherapySession {
  id: string
  status: string
  date: string
  type: string | null
  moodBefore: number | null
  moodAfter: number | null
  tags: string | null
  isRemote: boolean
  duration: number | null
  patient: { id: string; name: string }
  appointment: { id: string; startTime: string } | null
}

const statusStyles: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "info" }> = {
  SCHEDULED: { label: "Agendada", variant: "info" },
  IN_PROGRESS: { label: "Em andamento", variant: "warning" },
  PAUSED: { label: "Pausada", variant: "secondary" },
  COMPLETED: { label: "Concluída", variant: "success" },
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  async function loadSessions(cursorVal?: string) {
    const url = cursorVal ? `/api/sessoes?cursor=${cursorVal}&limit=30` : "/api/sessoes?limit=30"
    try {
      const r = await fetch(url)
      const d = await r.json()
      const items = d.data || []
      if (cursorVal) {
        setSessions((prev) => [...prev, ...items])
      } else {
        setSessions(items)
      }
      setCursor(d.nextCursor || null)
      setHasMore(!!d.nextCursor)
    } catch {
      // silent
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const filtered = sessions.filter((s) => {
    const matchSearch = !search || s.patient.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || s.status === filterStatus
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-36 animate-shimmer rounded-lg" />
            <div className="h-4 w-64 animate-shimmer rounded-lg" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 animate-shimmer rounded-lg" />
            <div className="h-9 w-36 animate-shimmer rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-48 animate-shimmer rounded-lg" />
          <div className="h-9 w-32 animate-shimmer rounded-lg" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full animate-shimmer" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 animate-shimmer rounded" />
                  <div className="h-3 w-20 animate-shimmer rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-24 animate-shimmer rounded-full" />
                <div className="h-5 w-20 animate-shimmer rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full animate-shimmer" />
                <div className="h-3 w-32 animate-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Sessões
          </h2>
          <p className="text-muted-foreground mt-1">Histórico completo de sessões terapêuticas</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 gap-2 shadow-lg shadow-violet-500/20">
          <Link href="/agenda">
            <Plus className="h-4 w-4" />
            Nova Sessão
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="flex gap-1">
          {[null, "SCHEDULED", "IN_PROGRESS", "COMPLETED"].map((s) => (
            <button
              key={s ?? "all"}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                filterStatus === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {s ? statusStyles[s]?.label || s : "Todas"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Activity className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Nenhuma sessão encontrada</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Crie um agendamento para iniciar uma sessão</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/agenda">Ir para Agenda</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((session, i) => {
            const st = statusStyles[session.status] || { label: session.status, variant: "secondary" as const }
            const moodDiff = session.moodBefore != null && session.moodAfter != null
              ? session.moodAfter - session.moodBefore
              : null

            return (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={`/sessoes/${session.id}`}>
                  <Card className="group card-hover h-full cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10 ring-2 ring-border group-hover:ring-emerald-300 transition-all">
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {getInitials(session.patient.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate group-hover:text-emerald-600 transition-colors">
                            {session.patient.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(session.date)}</span>
                          </div>
                        </div>
                        <Badge variant={st.variant} className="text-[10px] px-1.5 py-0 h-5">
                          {st.label}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {session.type && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/5 text-primary/70">
                            {session.type === "INDIVIDUAL" ? "Individual" :
                             session.type === "COUPLE" ? "Casal" :
                             session.type === "FAMILY" ? "Família" :
                             session.type === "GROUP" ? "Grupo" : session.type}
                          </span>
                        )}
                        {session.appointment && (
                          <span>{formatTime(session.appointment.startTime)}</span>
                        )}
                        {session.duration && (
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {Math.floor(session.duration / 60)}min
                          </span>
                        )}
                      </div>

                      {(session.moodBefore != null || session.moodAfter != null) && (
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Heart className="h-3 w-3 text-rose-400" />
                            <span>Pré: {session.moodBefore ?? "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Heart className="h-3 w-3 text-emerald-400" />
                            <span>Pós: {session.moodAfter ?? "—"}</span>
                          </div>
                          {moodDiff != null && moodDiff !== 0 && (
                            <span className={cn("font-medium", moodDiff > 0 ? "text-emerald-500" : "text-rose-500")}>
                              {moodDiff > 0 ? "+" : ""}{moodDiff}
                            </span>
                          )}
                        </div>
                      )}

                      {session.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {session.tags.split(",").slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {tag.trim()}
                            </span>
                          ))}
                          {session.tags.split(",").length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{session.tags.split(",").length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}

      {hasMore && !search && !filterStatus && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => { setLoadingMore(true); loadSessions(cursor!) }}
            disabled={loadingMore}
            className="gap-2"
          >
            {loadingMore ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /> : null}
            Carregar mais
          </Button>
        </div>
      )}
    </motion.div>
  )
}
