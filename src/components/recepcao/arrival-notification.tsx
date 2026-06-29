"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { Bell, UserCheck, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ArrivalNotification {
  id: string
  patientName: string | null
  arrivedAt: string
  receptionistId: string
}

export function ArrivalNotification() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<ArrivalNotification[]>([])
  const [show, setShow] = useState(false)
  const lastCheckRef = useRef<string>(new Date().toISOString())

  const checkArrivals = useCallback(async () => {
    if (!session?.user) return
    if (session.user.role === "RECEPTIONIST") return

    try {
      const res = await fetch("/api/recepcao/chegadas")
      if (!res.ok) return
      const data = await res.json()

      const newArrivals = (data.arrivals || []).filter(
        (a: { status: string; arrivedAt: string; id: string; patientName: string | null; receptionistId: string }) =>
          a.status === "ARRIVED" && new Date(a.arrivedAt) > new Date(lastCheckRef.current)
      )

      if (newArrivals.length > 0) {
        setNotifications(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const newOnes = newArrivals.filter((a: ArrivalNotification) => !existingIds.has(a.id))
          return [...prev, ...newOnes]
        })
        setShow(true)
      }

      lastCheckRef.current = new Date().toISOString()
    } catch {
    }
  }, [session])

  useEffect(() => {
    const interval = setInterval(checkArrivals, 5000)
    return () => clearInterval(interval)
  }, [checkArrivals])

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (notifications.length <= 1) setShow(false)
  }

  if (!show || notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(n => (
        <div
          key={n.id}
          className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg p-4 animate-in slide-in-from-right"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">Paciente chegou!</p>
              <p className="text-xs text-muted-foreground">
                {n.patientName || "Paciente"} está aguardando
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(n.arrivedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => dismiss(n.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
