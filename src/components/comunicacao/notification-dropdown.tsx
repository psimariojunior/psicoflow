"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Mail,
  ExternalLink,
  Calendar,
  CreditCard,
  PartyPopper,
} from "lucide-react"
import { cn, formatTime, formatCurrency } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface SummaryAppointment {
  id: string
  patientName: string
  startTime: string
  status: string
  modality: string
}

interface SummaryPayment {
  id: string
  number: string
  patientName: string
  amount: number
  dueDate: string
}

interface SummaryNotification {
  id: string
  title: string
  message: string
  channel: string
  status: string
  createdAt: string
}

interface Summary {
  appointments: SummaryAppointment[]
  pendingPayments: SummaryPayment[]
  unread: SummaryNotification[]
  unreadCount: number
  total: number
}

const statusLabel = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return "Agendado"
    case "CONFIRMED":
      return "Confirmado"
    case "IN_PROGRESS":
      return "Em andamento"
    case "COMPLETED":
      return "Concluído"
    default:
      return status
  }
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [marking, setMarking] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const prevUnreadRef = useRef(0)

  const playNotifSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "sine"
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.2)
    } catch {}
  }, [])

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/summary", { cache: "no-store" })
      if (!res.ok) return
      const data = (await res.json()) as Summary

      // Play sound on new notification
      if (data.unreadCount > prevUnreadRef.current && prevUnreadRef.current > 0) {
        playNotifSound()
      }
      prevUnreadRef.current = data.unreadCount
      setSummary(data)
    } catch {
      // silent fail
    }
  }, [playNotifSound])

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch("/api/notificacoes", { method: "PATCH" })
      fetchSummary()
    } catch {
      // silent
    }
  }, [fetchSummary])

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        setMarking(id)
        await fetch("/api/notificacoes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
        fetchSummary()
      } catch {
        // silent
      } finally {
        setMarking(null)
      }
    },
    [fetchSummary],
  )

  useEffect(() => {
    fetchSummary()
    const id = setInterval(fetchSummary, 60_000)
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchSummary()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [fetchSummary])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const total = summary?.total ?? 0
  const appointments = summary?.appointments ?? []
  const pendingPayments = summary?.pendingPayments ?? []
  const unread = summary?.unread ?? []

  const channelIcon = (ch: string) => {
    switch (ch) {
      case "WHATSAPP":
        return <MessageSquare className="h-3 w-3 text-emerald-500" />
      case "EMAIL":
        return <Mail className="h-3 w-3 text-blue-500" />
      default:
        return <Bell className="h-3 w-3" />
    }
  }

  const statusIcon = (st: string) => {
    switch (st) {
      case "SENT":
        return <CheckCircle className="h-3 w-3 text-emerald-500" />
      case "FAILED":
        return <XCircle className="h-3 w-3 text-destructive" />
      case "PENDING":
        return <Clock className="h-3 w-3 text-amber-500" />
      default:
        return null
    }
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => {
          const next = !open
          setOpen(next)
          if (next && unread.length > 0) markAllAsRead()
        }}
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
            <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-50" />
            <span className="relative">{unread.length > 9 ? "9+" : unread.length}</span>
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border bg-card shadow-xl animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Central de Notificações</h3>
            <Link
              href="/notificacoes"
              className="text-xs text-primary hover:underline"
              onClick={() => setOpen(false)}
            >
              Ver todas
            </Link>
          </div>

          <div className="max-h-[28rem] overflow-y-auto">
            {/* Today's appointments */}
            <Section
              icon={<Calendar className="h-3.5 w-3.5 text-blue-500" />}
              title="Consultas de hoje"
              count={appointments.length}
            >
              {appointments.length === 0 ? (
                <EmptyRow text="Nenhuma consulta hoje" />
              ) : (
                appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-3 border-b px-4 py-2.5 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex w-12 shrink-0 flex-col items-center justify-center">
                      <span className="text-sm font-bold leading-none">{formatTime(apt.startTime)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{apt.patientName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {apt.modality === "online" ? "Online" : "Presencial"} · {statusLabel(apt.status)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </Section>

            {/* Pending payments */}
            <Section
              icon={<CreditCard className="h-3.5 w-3.5 text-amber-500" />}
              title="Pagamentos pendentes"
              count={pendingPayments.length}
            >
              {pendingPayments.length === 0 ? (
                <EmptyRow text="Nenhum pagamento pendente" />
              ) : (
                pendingPayments.map((pay) => (
                  <div
                    key={pay.id}
                    className="flex items-center gap-3 border-b px-4 py-2.5 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                      <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{pay.patientName}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Fatura {pay.number} · vence {formatTime(pay.dueDate)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {formatCurrency(pay.amount)}
                    </span>
                  </div>
                ))
              )}
            </Section>

            {/* Unread notifications */}
            <Section
              icon={<Bell className="h-3.5 w-3.5 text-primary" />}
              title="Notificações não lidas"
              count={unread.length}
            >
              {unread.length === 0 ? (
                <EmptyRow text="Nenhuma notificação nova" />
              ) : (
                unread.map((n) => (
                  <div
                    key={n.id}
                    className="group flex items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      {channelIcon(n.channel)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {statusIcon(n.status)}
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(n.id)
                      }}
                      disabled={marking === n.id}
                      className="mt-0.5 shrink-0 rounded-full p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted"
                      title="Marcar como lida"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-emerald-500" />
                    </button>
                  </div>
                ))
              )}
            </Section>

            {total === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <PartyPopper className="h-8 w-8" />
                <p className="text-sm">Tudo em dia! Nada pendente.</p>
              </div>
            )}
          </div>

          <Link href="/notificacoes" onClick={() => setOpen(false)}>
            <div className="flex items-center justify-center gap-2 border-t px-4 py-3 text-xs text-primary transition-colors hover:bg-accent/50 rounded-b-xl">
              <Bell className="h-3.5 w-3.5" />
              Ver todas as notificações
              <ExternalLink className="h-3 w-3" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}

function Section({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode
  title: string
  count: number
  children: React.ReactNode
}) {
  if (count === 0) return null
  return (
    <div>
      <div className="flex items-center gap-2 bg-muted/40 px-4 py-2">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        <span className="ml-auto rounded-full bg-muted px-1.5 text-[10px] font-bold">{count}</span>
      </div>
      {children}
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <div className="px-4 py-3 text-xs text-muted-foreground">{text}</div>
}
