"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDateTime } from "@/lib/utils"
import { Plus, UserPlus, Bell, X, Calendar, Phone, Mail, Clock } from "lucide-react"
import toast from "react-hot-toast"

interface WaitingEntry {
  id: string
  patientName: string
  patientEmail?: string | null
  patientPhone?: string | null
  preferredDay?: string | null
  preferredTime?: string | null
  notes?: string | null
  status: string
  notifiedAt?: string | null
  createdAt: string
}

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
  WAITING: { label: "Aguardando", variant: "info" },
  NOTIFIED: { label: "Notificado", variant: "warning" },
  BOOKED: { label: "Agendado", variant: "success" },
  REMOVED: { label: "Removido", variant: "outline" },
}

const WEEKDAYS = [
  { value: "SEGUNDA", label: "Segunda-feira" },
  { value: "TERCA", label: "Terça-feira" },
  { value: "QUARTA", label: "Quarta-feira" },
  { value: "QUINTA", label: "Quinta-feira" },
  { value: "SEXTA", label: "Sexta-feira" },
  { value: "SABADO", label: "Sábado" },
]

const TIME_SLOTS = [
  { value: "MANHA", label: "Manhã (08h-12h)" },
  { value: "TARDE", label: "Tarde (13h-18h)" },
  { value: "NOITE", label: "Noite (18h-21h)" },
]

export default function ListaEsperaPage() {
  const [entries, setEntries] = useState<WaitingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    preferredDay: "",
    preferredTime: "",
    notes: "",
  })

  const loadEntries = () => {
    fetch("/api/lista-espera")
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then(setEntries)
      .catch(() => toast.error("Erro ao carregar lista de espera"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEntries() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/lista-espera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success("Adicionado à lista de espera!")
      setShowDialog(false)
      setForm({ patientName: "", patientEmail: "", patientPhone: "", preferredDay: "", preferredTime: "", notes: "" })
      loadEntries()
    } catch {
      toast.error("Erro ao adicionar")
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/lista-espera/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      const label = STATUS_MAP[status]?.label || status
      toast.success(`Marcado como "${label}"`)
      loadEntries()
    } catch {
      toast.error("Erro ao atualizar")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este paciente da lista de espera?")) return
    try {
      const res = await fetch(`/api/lista-espera/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Removido da lista")
      loadEntries()
    } catch {
      toast.error("Erro ao remover")
    }
  }

  const statusBadge = (status: string) => {
    const s = STATUS_MAP[status] || { label: status, variant: "outline" }
    const variants: Record<string, string> = {
      info: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
      warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      outline: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[s.variant] || variants.outline}`}>
        {s.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-shimmer rounded-lg" />
            <div className="h-4 w-64 animate-shimmer rounded-lg" />
          </div>
          <div className="h-9 w-36 animate-shimmer rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3">
              <div className="h-5 w-32 animate-shimmer rounded" />
              <div className="h-4 w-24 animate-shimmer rounded" />
              <div className="h-4 w-40 animate-shimmer rounded" />
              <div className="h-6 w-20 animate-shimmer rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const waitingCount = entries.filter((e) => e.status === "WAITING").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lista de Espera</h2>
          <p className="text-muted-foreground">
            {waitingCount > 0
              ? `${waitingCount} paciente${waitingCount > 1 ? "s" : ""} aguardando vaga`
              : "Gerencie pacientes aguardando por horários"}
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700"><Plus className="mr-2 h-4 w-4" /> Adicionar à Lista</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader><DialogTitle>Adicionar à Lista de Espera</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Paciente *</Label>
                <Input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="Nome completo" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.patientEmail} onChange={(e) => setForm({ ...form, patientEmail: e.target.value })} placeholder="email@exemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.patientPhone} onChange={(e) => setForm({ ...form, patientPhone: e.target.value })} placeholder="(31) 99999-9999" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preferência de Dia</Label>
                  <Select value={form.preferredDay} onValueChange={(v) => setForm({ ...form, preferredDay: v })}>
                    <SelectTrigger><SelectValue placeholder="Qualquer dia" /></SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preferência de Horário</Label>
                  <Select value={form.preferredTime} onValueChange={(v) => setForm({ ...form, preferredTime: v })}>
                    <SelectTrigger><SelectValue placeholder="Qualquer horário" /></SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Motivo da procura, restrições de horário..." />
              </div>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Adicionar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum paciente na lista de espera</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Adicione pacientes que estão aguardando por horários disponíveis.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 shrink-0">
                      <UserPlus className="h-4 w-4 text-teal-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{entry.patientName}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                    </div>
                  </div>
                  {statusBadge(entry.status)}
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {entry.patientEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{entry.patientEmail}</span>
                    </div>
                  )}
                  {entry.patientPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{entry.patientPhone}</span>
                    </div>
                  )}
                  {entry.preferredDay && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{WEEKDAYS.find(d => d.value === entry.preferredDay)?.label || entry.preferredDay}</span>
                    </div>
                  )}
                  {entry.preferredTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{TIME_SLOTS.find(t => t.value === entry.preferredTime)?.label || entry.preferredTime}</span>
                    </div>
                  )}
                </div>

                {entry.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">{entry.notes}</p>
                )}

                {entry.status === "WAITING" && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => handleStatusUpdate(entry.id, "NOTIFIED")}>
                      <Bell className="mr-1 h-3.5 w-3.5" /> Notificar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleStatusUpdate(entry.id, "BOOKED")}>
                      <Calendar className="mr-1 h-3.5 w-3.5" /> Agendar
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(entry.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {(entry.status === "NOTIFIED" || entry.status === "BOOKED") && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="ghost" className="text-destructive h-8" onClick={() => handleDelete(entry.id)}>
                      <X className="mr-1 h-3.5 w-3.5" /> Remover
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
