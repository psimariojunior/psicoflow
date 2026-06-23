"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePatientAuth } from "@/components/patient-auth-provider"
import toast from "react-hot-toast"
import { Loader2, Calendar, Clock, Video, MapPin, XCircle, CheckCircle2, FileText, ArrowLeft } from "lucide-react"

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  modality: string | null
  cancelReason: string | null
  notes: string | null
  psychologist: { name: string }
}

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split("T")[0].split("-")
  return `${d}/${m}/${y}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default function HistoricoPage() {
  const router = useRouter()
  const { token } = usePatientAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "realizada" | "cancelled">("all")

  useEffect(() => {
    if (!token) return
    fetch("/api/pacientes/agendamentos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = (data as Appointment[]).sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )
        setAppointments(sorted)
      })
      .catch(() => toast.error("Erro ao carregar histórico"))
      .finally(() => setLoading(false))
  }, [token])

  const filtered = appointments.filter((a) => {
    if (filter === "cancelled") return a.status === "CANCELLED"
    if (filter === "realizada") return a.status !== "CANCELLED" && new Date(a.startTime) <= new Date()
    return true
  })

  const tabs = [
    { key: "all" as const, label: "Todas" },
    { key: "realizada" as const, label: "Realizadas" },
    { key: "cancelled" as const, label: "Canceladas" },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Histórico de Sessões</h1>
        <p className="text-foreground text-sm mt-1">Todas as suas consultas realizadas</p>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === t.key
                ? "bg-primary/10 text-primary ring-1 ring-emerald-500/30"
                : "text-muted-foreground hover:text-accent-foreground bg-card"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma sessão encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="bg-card rounded-xl p-4 ring-1 ring-border"
            >
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                  a.status === "CANCELLED"
                    ? "bg-red-500/10"
                    : "bg-primary/10"
                }`}>
                  {a.status === "CANCELLED"
                    ? <XCircle className="h-5 w-5 text-red-400" />
                    : <CheckCircle2 className="h-5 w-5 text-primary" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-foreground font-medium">{formatDateBR(a.startTime)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === "CANCELLED"
                        ? "bg-red-500/10 text-red-300"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {a.status === "CANCELLED" ? "Cancelada" : "Realizada"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      {formatTime(a.startTime)} — {formatTime(a.endTime)}
                    </span>
                    <span>{a.modality === "online" ? "Online" : "Presencial"}</span>
                    <span>{a.psychologist.name}</span>
                  </div>
                  {a.status === "CANCELLED" && a.cancelReason && (
                    <p className="text-sm text-muted-foreground mt-1.5">
                      Motivo: {a.cancelReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
