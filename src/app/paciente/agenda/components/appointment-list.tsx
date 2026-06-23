"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import toast from "react-hot-toast"
import { Loader2, Calendar, Clock, XCircle } from "lucide-react"

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  modality: string | null
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

export function AppointmentList({
  appointments,
  token,
  onAppointmentsChange,
}: {
  appointments: Appointment[]
  token: string
  onAppointmentsChange: (appointments: Appointment[]) => void
}) {
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const handleCancel = async (appointmentId: string, reason: string) => {
    setCancelling(appointmentId)
    try {
      const res = await fetch(`/api/pacientes/agendamentos/${appointmentId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: reason || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao cancelar")
      }
      toast.success("Consulta cancelada")
      onAppointmentsChange(appointments.map((a) => a.id === appointmentId ? { ...a, status: "CANCELLED" } : a))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao cancelar")
    } finally {
      setCancelling(null)
      setCancelTarget(null)
      setCancelReason("")
    }
  }

  const upcoming = appointments.filter((a) => new Date(a.startTime) > new Date() && a.status !== "CANCELLED")
  const past = appointments.filter((a) => new Date(a.startTime) <= new Date() || a.status === "CANCELLED")

  return (
    <>
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Próximas consultas</h2>
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div key={a.id} className="bg-card hover:bg-accent rounded-xl p-4 ring-1 ring-border transition-all">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium">{formatDateBR(a.startTime)}</p>
                    <p className="text-foreground text-sm">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      {formatTime(a.startTime)} — {formatTime(a.endTime)}
                    </p>
                  </div>
                  <div className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full hidden sm:block">
                    {a.modality === "online" ? "Online" : "Presencial"}
                  </div>
                  <Dialog open={cancelTarget === a.id} onOpenChange={(open) => { if (!open) { setCancelTarget(null); setCancelReason("") } }}>
                    <DialogTrigger asChild>
                      <button onClick={() => setCancelTarget(a.id)} disabled={cancelling === a.id}
                        className="text-muted-foreground hover:text-red-400 transition-colors p-1 disabled:opacity-50" title="Cancelar consulta">
                        {cancelling === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-5 w-5" />}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Cancelar consulta</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Tem certeza que deseja cancelar a consulta do dia {formatDateBR(a.startTime)}?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-foreground block mb-1">Motivo (opcional)</label>
                          <Input placeholder="Ex: imprevisto, mudança de horário..." value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                          <DialogClose asChild>
                            <Button variant="outline" className="flex-1">Voltar</Button>
                          </DialogClose>
                          <Button variant="destructive" className="flex-1" disabled={cancelling === a.id}
                            onClick={() => handleCancel(a.id, cancelReason)}>
                            {cancelling === a.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Cancelar consulta
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h2>
          <div className="space-y-2">
            {past.slice(0, 5).map((a) => (
              <div key={a.id} className="bg-card rounded-xl p-3 ring-1 ring-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm">{formatDateBR(a.startTime)} — {formatTime(a.startTime)}</p>
                    <p className="text-muted-foreground text-xs">{a.status === "CANCELLED" ? "Cancelada" : "Realizada"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
