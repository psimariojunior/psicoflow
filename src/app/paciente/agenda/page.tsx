"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { usePatientAuth } from "@/components/patient-auth-provider"
import toast from "react-hot-toast"
import { Loader2, Calendar, Clock, ChevronLeft, ChevronRight, Sparkles, Shield, Video, Heart, XCircle } from "lucide-react"

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  modality: string | null
  psychologist: { name: string }
}

interface TimeSlot {
  time: string
  startTime: string
  endTime: string
}

interface AvailableDay {
  date: string
  dayOfWeek: number
  slots: TimeSlot[]
}

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split("T")[0].split("-")
  return `${d}/${m}/${y}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default function AgendaPacientePage() {
  const { patient, token } = usePatientAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppts, setLoadingAppts] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedModality, setSelectedModality] = useState<string>("online")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())

  useEffect(() => {
    if (!token) return
    fetch("/api/pacientes/agendamentos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAppointments)
      .catch(() => toast.error("Erro ao carregar agendamentos"))
      .finally(() => setLoadingAppts(false))
  }, [token])

  const loadAvailability = useCallback(async () => {
    try {
      const res = await fetch("/api/disponibilidade/public")
      const data = await res.json()
      setAvailableDays(data.availableDays || [])
    } catch {
      toast.error("Erro ao carregar horários")
    }
  }, [])

  const handleStartBooking = () => {
    setShowBooking(true)
    loadAvailability()
  }

  const availableDates = new Set(availableDays.map((d) => d.date))
  const selectedDay = availableDays.find((d) => d.date === selectedDate)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const handleBook = useCallback(async () => {
    if (!selectedSlot || !token) return
    setBookingLoading(true)
    try {
      const res = await fetch("/api/agendamentos/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: patient?.name || "",
          email: patient?.email || undefined,
          phone: patient?.phone || undefined,
          startTime: selectedSlot.startTime,
          modality: selectedModality,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao agendar")

      toast.success("Consulta agendada!")
      setShowBooking(false)
      setSelectedDate(null)
      setSelectedSlot(null)

      const res2 = await fetch("/api/pacientes/agendamentos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const appts = await res2.json()
      setAppointments(appts)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao agendar")
    } finally {
      setBookingLoading(false)
    }
  }, [selectedSlot, token, patient, selectedModality])

  const handleCancel = useCallback(async (appointmentId: string, reason: string) => {
    if (!token) return
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
      setAppointments((prev) => prev.map((a) => a.id === appointmentId ? { ...a, status: "CANCELLED" } : a))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao cancelar")
    } finally {
      setCancelling(null)
      setCancelTarget(null)
      setCancelReason("")
    }
  }, [token])

  const upcoming = appointments.filter((a) => new Date(a.startTime) > new Date() && a.status !== "CANCELLED")
  const past = appointments.filter((a) => new Date(a.startTime) <= new Date() || a.status === "CANCELLED")
  const hasAppointments = upcoming.length > 0 || past.length > 0
  const isFirstTime = !hasAppointments && !loadingAppts

  return (
    <div className="min-h-screen">
      {!showBooking && isFirstTime && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
          <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute top-20 -right-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="relative max-w-2xl mx-auto px-4 pt-16 pb-12 text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 ring-1 ring-emerald-500/20 mb-6">
              <Sparkles className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Bem-vindo, {patient?.name?.split(" ")[0]}!
            </h1>
            <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
              Sua jornada de autocuidado começa aqui. Agende sua primeira consulta em poucos cliques.
            </p>
          </div>

          <div className="max-w-2xl mx-auto px-4 pb-8">
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Shield, label: "Privacidade", desc: "Totalmente seguro" },
                { icon: Video, label: "Online", desc: "De qualquer lugar" },
                { icon: Heart, label: "Acolhimento", desc: "Profissional dedicado" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-slate-800/50 rounded-2xl p-4 text-center ring-1 ring-slate-700/50">
                  <Icon className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-200 font-medium">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartBooking}
              className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-[1px] shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300"
            >
              <div className="relative rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex items-center justify-center gap-3">
                <Calendar className="h-6 w-6 text-white" />
                <span className="text-lg font-semibold text-white">Agendar minha primeira consulta</span>
                <ChevronRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Consultas online com duração de 40 minutos
              </p>
            </div>
          </div>
        </div>
      )}

      {!showBooking && !isFirstTime && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Minha Agenda</h1>
              <p className="text-gray-300 text-sm mt-1">Olá, {patient?.name?.split(" ")[0]}</p>
            </div>
            <Button onClick={handleStartBooking} className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar consulta
            </Button>
          </div>

          {loadingAppts ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Próximas consultas</h2>
                  <div className="space-y-3">
                    {upcoming.map((a) => (
                      <div key={a.id} className="bg-slate-800/50 hover:bg-slate-800 rounded-xl p-4 ring-1 ring-slate-700/50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                            <Calendar className="h-6 w-6 text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">{formatDateBR(a.startTime)}</p>
                            <p className="text-gray-300 text-sm">
                              <Clock className="h-3.5 w-3.5 inline mr-1" />
                              {formatTime(a.startTime)} — {formatTime(a.endTime)}
                            </p>
                          </div>
                          <div className="text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full">
                            {a.modality === "online" ? "Online" : "Presencial"}
                          </div>
                          <Dialog open={cancelTarget === a.id} onOpenChange={(open) => { if (!open) { setCancelTarget(null); setCancelReason("") } }}>
                            <DialogTrigger asChild>
                              <button
                                onClick={() => setCancelTarget(a.id)}
                                disabled={cancelling === a.id}
                                className="text-gray-500 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
                                title="Cancelar consulta"
                              >
                                {cancelling === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-5 w-5" />}
                              </button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
                              <DialogHeader>
                                <DialogTitle>Cancelar consulta</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Tem certeza que deseja cancelar a consulta do dia {formatDateBR(a.startTime)}?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm text-gray-300 block mb-1">Motivo (opcional)</label>
                                  <Input
                                    placeholder="Ex: imprevisto, mudança de horário..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-500"
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <DialogClose asChild>
                                    <Button variant="outline" className="flex-1 border-slate-600 text-gray-300">Voltar</Button>
                                  </DialogClose>
                                  <Button
                                    variant="destructive"
                                    className="flex-1"
                                    disabled={cancelling === a.id}
                                    onClick={() => handleCancel(a.id, cancelReason)}
                                  >
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
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Histórico</h2>
                  <div className="space-y-2">
                    {past.slice(0, 5).map((a) => (
                      <div key={a.id} className="bg-slate-800/30 rounded-xl p-3 ring-1 ring-slate-700/30">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-300 text-sm">{formatDateBR(a.startTime)} — {formatTime(a.startTime)}</p>
                            <p className="text-gray-500 text-xs">{a.status === "CANCELLED" ? "Cancelada" : "Realizada"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {showBooking && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          {!selectedDate ? (
            <>
              <button onClick={() => setShowBooking(false)} className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm mb-6 transition-all">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white">Agendar consulta</h1>
                <p className="text-gray-300 text-sm mt-1">Escolha o melhor dia para você</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-6 ring-1 ring-slate-700/50">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) } else { setCurrentMonth(currentMonth - 1) } }} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-slate-700/50 transition-all">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-lg font-semibold text-white">{MONTH_NAMES[currentMonth]} {currentYear}</h2>
                  <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) } else { setCurrentMonth(currentMonth + 1) } }} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-slate-700/50 transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAY_NAMES_SHORT.map((d) => (
                    <div key={d} className="text-center text-xs text-gray-400 font-medium py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfWeek }, (_, i) => (<div key={`e-${i}`} />))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                    const isAvail = availableDates.has(dateStr)
                    const isToday = dateStr === new Date().toISOString().split("T")[0]
                    return (
                      <button key={day} disabled={!isAvail} onClick={() => setSelectedDate(dateStr)}
                        className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                          isAvail
                            ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
                            : "text-gray-600 cursor-not-allowed"
                        } ${isToday ? "ring-1 ring-emerald-500/40" : ""}`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          ) : !selectedSlot ? (
            <>
              <button onClick={() => setSelectedDate(null)} className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm mb-6 transition-all">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <div className="bg-slate-800/50 rounded-2xl p-6 ring-1 ring-slate-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{formatDateBR(selectedDate)}</h2>
                    <p className="text-gray-400 text-sm">
                      {["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"][new Date(selectedDate).getDay()]}
                    </p>
                  </div>
                </div>
                {selectedDay && selectedDay.slots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedDay.slots.map((s) => (
                      <button key={s.time} onClick={() => setSelectedSlot(s)}
                        className="bg-slate-700/50 hover:bg-emerald-500/15 text-gray-200 hover:text-emerald-300 rounded-xl py-3 px-4 text-sm font-medium transition-all ring-1 ring-slate-600/50 hover:ring-emerald-500/30"
                      >
                        <Clock className="h-4 w-4 inline mr-1.5" />{s.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhum horário disponível neste dia</p>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => setSelectedSlot(null)} className="flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm mb-6 transition-all">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/20 mb-4">
                  <Calendar className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white">{formatDateBR(selectedDate)}</h2>
                <p className="text-gray-300 text-lg">às {selectedSlot.time}</p>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-6 ring-1 ring-slate-700/50 mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Modalidade</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setSelectedModality("online")}
                    className={`rounded-xl py-4 px-4 text-sm font-medium transition-all ring-1 text-left ${
                      selectedModality === "online"
                        ? "bg-emerald-500/15 ring-emerald-500/30 text-emerald-300"
                        : "bg-slate-700/50 ring-slate-600/50 text-gray-300 hover:bg-slate-700"
                    }`}
                  >
                    <Video className="h-5 w-5 mb-1.5" />
                    <p className="font-medium">Online</p>
                    <p className="text-xs mt-0.5 opacity-70">Videochamada</p>
                  </button>
                  <button onClick={() => setSelectedModality("presential")}
                    className={`rounded-xl py-4 px-4 text-sm font-medium transition-all ring-1 text-left ${
                      selectedModality === "presential"
                        ? "bg-emerald-500/15 ring-emerald-500/30 text-emerald-300"
                        : "bg-slate-700/50 ring-slate-600/50 text-gray-300 hover:bg-slate-700"
                    }`}
                  >
                    <Calendar className="h-5 w-5 mb-1.5" />
                    <p className="font-medium">Presencial</p>
                    <p className="text-xs mt-0.5 opacity-70">No consultório</p>
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-6 ring-1 ring-slate-700/50 mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Confirmar agendamento</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <span className="text-emerald-400 text-xs font-bold">{patient?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-gray-200">{patient?.name}</span>
                  </div>
                  {patient?.email && (
                    <p className="text-gray-300 text-sm ml-11">{patient.email}</p>
                  )}
                  {patient?.phone && (
                    <p className="text-gray-300 text-sm ml-11">{patient.phone}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleBook} disabled={bookingLoading}
                className="w-full h-13 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300">
                {bookingLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {bookingLoading ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
