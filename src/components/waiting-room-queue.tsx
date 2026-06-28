"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, Loader2, UserCheck, UserX, Clock, Bell, Users } from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface WaitingPatient {
  id: string
  room: string
  name: string
  status: "waiting" | "approved" | "rejected"
  createdAt: number
}

// Shared state for badge count across components
let globalWaitingCount = 0
let globalListeners: ((count: number) => void)[] = []

export function getWaitingCount() { return globalWaitingCount }
export function onWaitingCountChange(fn: (count: number) => void) {
  globalListeners.push(fn)
  return () => { globalListeners = globalListeners.filter(l => l !== fn) }
}

function setGlobalWaitingCount(count: number) {
  globalWaitingCount = count
  globalListeners.forEach(l => l(count))
}

export function WaitingRoomBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch("/api/livekit/waiting")
        if (!res.ok) return
        const data = await res.json()
        const waiting = (data.patients || []).filter((p: WaitingPatient) => p.status === "waiting")
        if (!cancelled) {
          setCount(waiting.length)
          setGlobalWaitingCount(waiting.length)
        }
      } catch {}
    }
    const interval = setInterval(poll, 5000)
    poll()
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  if (count === 0) return null

  return (
    <span className="absolute -top-1 -right-1 flex min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white animate-pulse">
      {count}
    </span>
  )
}

export function WaitingRoomQueue() {
  const [patients, setPatients] = useState<WaitingPatient[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch("/api/livekit/waiting")
      if (!res.ok) return
      const data = await res.json()
      setPatients(data.patients || [])
      setGlobalWaitingCount((data.patients || []).filter((p: WaitingPatient) => p.status === "waiting").length)
    } catch {}
  }, [])

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      if (!cancelled) await fetchPatients()
    }
    const interval = setInterval(poll, 3000)
    poll()
    return () => { cancelled = true; clearInterval(interval) }
  }, [fetchPatients])

  const handleApprove = async (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch("/api/livekit/waiting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approved" }),
      })
      if (!res.ok) throw new Error()
      toast.success("Paciente aprovado!")
      fetchPatients()
    } catch {
      toast.error("Erro ao aprovar")
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleReject = async (id: string) => {
    setLoading(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch("/api/livekit/waiting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "rejected" }),
      })
      if (!res.ok) throw new Error()
      toast.success("Paciente recusado")
      fetchPatients()
    } catch {
      toast.error("Erro ao recusar")
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }))
    }
  }

  const waiting = patients.filter(p => p.status === "waiting")
  const processed = patients.filter(p => p.status !== "waiting")

  if (waiting.length === 0 && processed.length === 0) return null

  return (
    <Card className="border-amber-200 dark:border-amber-900/50 shadow-lg shadow-amber-500/5 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="relative">
            <Bell className="h-5 w-5 text-amber-500" />
            {waiting.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white animate-pulse">
                {waiting.length}
              </span>
            )}
          </div>
          Sala de Espera
          {waiting.length > 0 && (
            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-xs">
              {waiting.length} aguardando
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {waiting.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">Nenhum paciente aguardando no momento.</p>
        )}
        {waiting.map(patient => (
          <div key={patient.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 shrink-0">
              <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{patient.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(patient.createdAt), { addSuffix: true, locale: ptBR })}</span>
                <span className="text-muted-foreground/50">·</span>
                <span className="truncate">{patient.room}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                asChild
              >
                <Link href={`/sala-virtual?room=${encodeURIComponent(patient.room)}`} onClick={() => handleApprove(patient.id)}>
                  {loading[patient.id] ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5 mr-1" />
                      Entrar
                    </>
                  )}
                </Link>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-red-500 hover:bg-red-100 hover:text-red-600"
                onClick={() => handleReject(patient.id)}
                disabled={loading[patient.id]}
              >
                <UserX className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {processed.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-1.5">Recentemente processados</p>
            {processed.slice(0, 3).map(patient => (
              <div key={patient.id} className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                <span className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  patient.status === "approved" ? "bg-emerald-400" : "bg-red-400"
                )} />
                <span className="truncate">{patient.name}</span>
                <span className="ml-auto text-[10px]">{patient.status === "approved" ? "Aceito" : "Recusado"}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
