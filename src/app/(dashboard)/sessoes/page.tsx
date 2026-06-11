"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, formatDateTime } from "@/lib/utils"
import { Loader2, Clock, Play, CheckCircle, Pause, Calendar, User } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface SessionListItem {
  id: string
  status: string
  date: string
  duration: number | null
  type: string | null
  isRemote: boolean
  patient: { id: string; name: string }
  appointment: { id: string; startTime: string } | null
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--:--"
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function SessoesPage() {
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/sessoes")
      .then((r) => r.json())
      .then((data) => setSessions(data || []))
      .catch(() => toast.error("Erro ao carregar sessões"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Sessões</h2>
        <p className="text-gray-400 text-sm">Histórico de sessões realizadas</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Clock className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhuma sessão encontrada</p>
            <p className="text-sm mt-1">As sessões aparecerão aqui quando você iniciar um atendimento</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((sess) => (
            <Link key={sess.id} href={`/sessoes/${sess.id}`}>
              <div className="bg-slate-900/50 hover:bg-slate-900/80 rounded-xl p-4 ring-1 ring-slate-700/50 transition-all flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-xs">
                    {getInitials(sess.patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{sess.patient.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {sess.appointment ? formatDateTime(sess.appointment.startTime) : formatDateTime(sess.date)}
                    </span>
                    {sess.type && <span>{sess.type}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                    sess.status === "IN_PROGRESS" ? "bg-emerald-500/15 text-emerald-400" :
                    sess.status === "PAUSED" ? "bg-amber-500/15 text-amber-400" :
                    sess.status === "COMPLETED" ? "bg-slate-800 text-gray-300" :
                    "bg-slate-800 text-gray-400"
                  }`}>
                    {sess.status === "IN_PROGRESS" ? <Play className="h-3 w-3" /> :
                     sess.status === "PAUSED" ? <Pause className="h-3 w-3" /> :
                     sess.status === "COMPLETED" ? <CheckCircle className="h-3 w-3" /> :
                     <Clock className="h-3 w-3" />}
                    <span>{
                      sess.status === "SCHEDULED" ? "Agendada" :
                      sess.status === "IN_PROGRESS" ? "Em andamento" :
                      sess.status === "PAUSED" ? "Pausada" :
                      sess.status === "COMPLETED" ? "Concluída" : sess.status
                    }</span>
                  </div>
                  {sess.duration && (
                    <span className="text-xs text-gray-400 font-mono tabular-nums">{formatDuration(sess.duration)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
