"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, XCircle, Clock, MessageSquare, Mail, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Notification {
  id: string
  title: string
  message: string
  channel: string
  status: string
  createdAt: string
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    fetch("/api/notificacoes")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setNotifications(list.slice(0, 5))
        setUnread(list.filter((n: Notification) => n.status === "PENDING").length)
      })
      .catch(() => {})
  }, [])

  const channelIcon = (ch: string) => {
    switch (ch) {
      case "WHATSAPP": return <MessageSquare className="h-3 w-3 text-emerald-500" />
      case "EMAIL": return <Mail className="h-3 w-3 text-blue-500" />
      default: return <Bell className="h-3 w-3" />
    }
  }

  const statusIcon = (st: string) => {
    switch (st) {
      case "SENT": return <CheckCircle className="h-3 w-3 text-emerald-500" />
      case "FAILED": return <XCircle className="h-3 w-3 text-destructive" />
      case "PENDING": return <Clock className="h-3 w-3 text-amber-500" />
      default: return null
    }
  }

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(!open)}>
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
            <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-50" />
            <span className="relative">{unread > 9 ? "9+" : unread}</span>
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-card shadow-xl animate-in slide-in-from-top-2 fade-in">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Notificações</h3>
            <Link href="/notificacoes" className="text-xs text-primary hover:underline" onClick={() => setOpen(false)}>
              Ver todas
            </Link>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <Bell className="h-8 w-8" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={cn(
                  "flex items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/50",
                  n.status === "PENDING" && "bg-accent/30"
                )}>
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    {channelIcon(n.channel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <div className="mt-1 flex items-center gap-2">
                      {statusIcon(n.status)}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href="/comunicacao" onClick={() => setOpen(false)}>
            <div className="flex items-center justify-center gap-2 border-t px-4 py-3 text-xs text-primary hover:bg-accent/50 transition-colors rounded-b-xl">
              <MessageSquare className="h-3.5 w-3.5" />
              Ir para Comunicação
              <ExternalLink className="h-3 w-3" />
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
